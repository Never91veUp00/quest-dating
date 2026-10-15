-- CHECK на created_quests.theme из 004 пускал только 4 темы, и сохранение квеста
-- с treasure/proposal падало с 500. Если 003 отработала раньше 004, колонка уже есть,
-- ADD COLUMN IF NOT EXISTS в 004 пропускается, и CHECK вообще не создаётся.
-- Пересоздаём ограничение с полным списком; имя совпадает с автоименем inline CHECK
-- (<table>_<column>_check) и с dump.sql. Миграция идемпотентна.
-- Список тем: QUEST_THEMES в server/src/routes/admin.js и themes.js плеера.
ALTER TABLE created_quests DROP CONSTRAINT IF EXISTS created_quests_theme_check;
ALTER TABLE created_quests ADD CONSTRAINT created_quests_theme_check
  CHECK (theme IN ('detective', 'romantic', 'city', 'mystery', 'treasure', 'proposal'));
