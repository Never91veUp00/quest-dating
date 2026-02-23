-- ============================================================
-- Migration: добавить theme и final_message в created_quests
-- Запустить: psql -d quest_dating -f migration_quest_fields.sql
-- ============================================================

ALTER TABLE created_quests
  ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'detective'
    CHECK (theme IN ('detective', 'romantic', 'city', 'mystery')),
  ADD COLUMN IF NOT EXISTS final_message TEXT;

COMMENT ON COLUMN created_quests.theme IS 'Визуальная тема плеера: detective | romantic | city | mystery';
COMMENT ON COLUMN created_quests.final_message IS 'Персональное послание заказчика, показывается на финальном экране';

SELECT 'Migration applied: theme + final_message added to created_quests' AS result;