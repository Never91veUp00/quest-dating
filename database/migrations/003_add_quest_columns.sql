-- Миграция: добавить колонки если их нет
ALTER TABLE created_quests ADD COLUMN IF NOT EXISTS show_intro BOOLEAN DEFAULT true;
ALTER TABLE created_quests ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'detective';
ALTER TABLE created_quests ADD COLUMN IF NOT EXISTS final_message TEXT;