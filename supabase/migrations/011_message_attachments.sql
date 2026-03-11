-- Add photo attachments support to application messages
ALTER TABLE application_messages
  ADD COLUMN photo_paths TEXT[] NOT NULL DEFAULT '{}';
