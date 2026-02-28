-- Create public storage buckets for file uploads
-- Using ON CONFLICT to make this idempotent

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('application-photos', 'application-photos', true),
  ('gallery', 'gallery', true),
  ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;
