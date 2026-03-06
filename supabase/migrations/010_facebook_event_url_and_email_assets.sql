-- Add facebook_event_url to event_editions
ALTER TABLE event_editions ADD COLUMN facebook_event_url TEXT;

-- Create email-assets storage bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('email-assets', 'email-assets', true)
ON CONFLICT DO NOTHING;
