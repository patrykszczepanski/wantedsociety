-- Migration 009: Email threading support

-- Add direction and thread_id columns
ALTER TABLE inbound_emails
  ADD COLUMN direction TEXT NOT NULL DEFAULT 'inbound',
  ADD COLUMN thread_id UUID;

CREATE INDEX idx_inbound_emails_thread_id ON inbound_emails(thread_id);
CREATE INDEX idx_inbound_emails_message_id ON inbound_emails(message_id);

-- Backfill: group existing emails by application_id where possible
UPDATE inbound_emails e
SET thread_id = sub.first_id
FROM (
  SELECT DISTINCT ON (application_id) id AS first_id, application_id
  FROM inbound_emails
  WHERE application_id IS NOT NULL
  ORDER BY application_id, created_at ASC
) sub
WHERE e.application_id = sub.application_id;

-- For unlinked emails (no application_id), each is its own thread
UPDATE inbound_emails
SET thread_id = id
WHERE thread_id IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE inbound_emails ALTER COLUMN thread_id SET NOT NULL;

-- RPC: Get thread list with aggregated data
CREATE OR REPLACE FUNCTION get_email_threads(
  p_status TEXT DEFAULT NULL,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  thread_id UUID,
  subject TEXT,
  participant_email TEXT,
  participant_name TEXT,
  application_id UUID,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  message_count BIGINT,
  unread_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.thread_id,
    (ARRAY_AGG(e.subject ORDER BY e.created_at ASC) FILTER (WHERE e.subject IS NOT NULL))[1] AS subject,
    (ARRAY_AGG(e.from_email ORDER BY e.created_at ASC) FILTER (WHERE e.direction = 'inbound'))[1] AS participant_email,
    (ARRAY_AGG(e.from_name ORDER BY e.created_at ASC) FILTER (WHERE e.direction = 'inbound'))[1] AS participant_name,
    (ARRAY_AGG(e.application_id ORDER BY e.created_at ASC) FILTER (WHERE e.application_id IS NOT NULL))[1] AS application_id,
    MAX(e.created_at) AS last_message_at,
    (ARRAY_AGG(COALESCE(LEFT(e.body_text, 120), '') ORDER BY e.created_at DESC))[1] AS last_message_preview,
    COUNT(*)::BIGINT AS message_count,
    COUNT(*) FILTER (WHERE e.status = 'unread')::BIGINT AS unread_count
  FROM inbound_emails e
  GROUP BY e.thread_id
  HAVING (
    p_status IS NULL
    OR (p_status = 'unread' AND COUNT(*) FILTER (WHERE e.status = 'unread') > 0)
    OR (p_status = 'archived' AND COUNT(*) FILTER (WHERE e.status = 'archived') = COUNT(*))
    OR (p_status = 'linked' AND BOOL_OR(e.application_id IS NOT NULL))
    OR (p_status NOT IN ('unread', 'archived', 'linked') AND EXISTS (
      SELECT 1 FROM inbound_emails ie WHERE ie.thread_id = e.thread_id AND ie.status = p_status
    ))
  )
  ORDER BY MAX(e.created_at) DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- RPC: Count threads for pagination
CREATE OR REPLACE FUNCTION count_email_threads(p_status TEXT DEFAULT NULL)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM (
      SELECT e.thread_id
      FROM inbound_emails e
      GROUP BY e.thread_id
      HAVING (
        p_status IS NULL
        OR (p_status = 'unread' AND COUNT(*) FILTER (WHERE e.status = 'unread') > 0)
        OR (p_status = 'archived' AND COUNT(*) FILTER (WHERE e.status = 'archived') = COUNT(*))
        OR (p_status = 'linked' AND BOOL_OR(e.application_id IS NOT NULL))
        OR (p_status NOT IN ('unread', 'archived', 'linked') AND EXISTS (
          SELECT 1 FROM inbound_emails ie WHERE ie.thread_id = e.thread_id AND ie.status = p_status
        ))
      )
    ) threads
  );
END;
$$ LANGUAGE plpgsql;
