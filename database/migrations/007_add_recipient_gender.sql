ALTER TABLE created_quests
  ADD COLUMN IF NOT EXISTS recipient_gender VARCHAR(1) NOT NULL DEFAULT 'f';
