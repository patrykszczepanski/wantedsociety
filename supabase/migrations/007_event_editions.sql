-- 007_event_editions.sql
-- Introduce event editions system

-- 1. Create event_editions table
CREATE TABLE event_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  year INT NOT NULL,
  event_date DATE,
  event_date_display TEXT,
  location TEXT,
  description TEXT,
  instagram_embed_url TEXT,
  applications_open BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partial unique index: only one edition can have applications_open = true
CREATE UNIQUE INDEX idx_event_editions_one_active
  ON event_editions (applications_open) WHERE applications_open = true;

-- Auto-update updated_at trigger
CREATE TRIGGER set_event_editions_updated_at
  BEFORE UPDATE ON event_editions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 2. Add event_edition_id to applications (nullable first for backfill)
ALTER TABLE applications ADD COLUMN event_edition_id UUID;

-- 3. Insert legacy edition with existing hardcoded event data
INSERT INTO event_editions (id, name, year, event_date, event_date_display, location, description, instagram_embed_url, applications_open)
VALUES (
  gen_random_uuid(),
  'Summer Core 1.0',
  2025,
  '2025-06-22',
  '22 czerwca 2025',
  'Resort Piaseczno',
  'Wanted Wave Summer Core to nasz flagowy event sezonu letniego. Wystawa najlepszych aut ze sceny stance i fitment, muzyka, food trucki i niezapomniana atmosfera nad wodą. Nie przegap tego!',
  'https://www.instagram.com/reel/DLX9wO7ibZR/embed',
  false
);

-- 4. Backfill all existing applications with the legacy edition ID
UPDATE applications SET event_edition_id = (SELECT id FROM event_editions WHERE name = 'Summer Core 1.0' AND year = 2025 LIMIT 1);

-- 5. Set event_edition_id to NOT NULL
ALTER TABLE applications ALTER COLUMN event_edition_id SET NOT NULL;

-- 6. Add FK constraint
ALTER TABLE applications ADD CONSTRAINT fk_applications_event_edition
  FOREIGN KEY (event_edition_id) REFERENCES event_editions(id);

-- 7. Drop old unique constraint and add new one with event_edition_id
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_user_id_type_key;
ALTER TABLE applications ADD CONSTRAINT applications_user_id_type_edition_key UNIQUE (user_id, type, event_edition_id);

-- 8. Add index for filtering by edition
CREATE INDEX idx_applications_event_edition_id ON applications(event_edition_id);

-- 9. Disable RLS (consistent with rest of project)
ALTER TABLE event_editions DISABLE ROW LEVEL SECURITY;
