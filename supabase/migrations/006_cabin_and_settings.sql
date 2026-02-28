-- Cabin columns on applications
ALTER TABLE applications
  ADD COLUMN wants_cabin BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN cabin_payment_confirmed BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_applications_wants_cabin ON applications(wants_cabin) WHERE wants_cabin = true;

-- Site settings key-value store
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Seed defaults
INSERT INTO site_settings (key, value) VALUES
  ('cabin_price_pln', '250'),
  ('cabin_payment_deadline_message', 'Wpłatę za domek należy zrealizować do 01.06.2026r.');
