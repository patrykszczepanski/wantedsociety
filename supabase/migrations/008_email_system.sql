-- Migration 008: Email system tables

-- Inbound emails table
CREATE TABLE inbound_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  in_reply_to TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  application_message_id UUID REFERENCES application_messages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_inbound_emails_status ON inbound_emails(status);
CREATE INDEX idx_inbound_emails_application_id ON inbound_emails(application_id);

-- Auto-update updated_at trigger for inbound_emails
CREATE TRIGGER set_inbound_emails_updated_at
  BEFORE UPDATE ON inbound_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Outbound email log table
CREATE TABLE outbound_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resend_id TEXT,
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT,
  template TEXT,
  related_id UUID,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add source and inbound_email_id to application_messages
ALTER TABLE application_messages
  ADD COLUMN source TEXT NOT NULL DEFAULT 'web',
  ADD COLUMN inbound_email_id UUID REFERENCES inbound_emails(id) ON DELETE SET NULL;

-- Disable RLS on new tables (access control is handled at the API layer)
ALTER TABLE inbound_emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_email_log DISABLE ROW LEVEL SECURITY;
