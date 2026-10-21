-- Новая тема плеера «Хеллоуин» (halloween): расширяем CHECK на created_quests.theme.
-- Список тем: QUEST_THEMES в server/src/routes/admin.js и themes.js плеера.
-- Миграция идемпотентна: ограничение пересоздаётся с полным списком.
ALTER TABLE created_quests DROP CONSTRAINT IF EXISTS created_quests_theme_check;
ALTER TABLE created_quests ADD CONSTRAINT created_quests_theme_check
  CHECK (theme IN ('detective', 'romantic', 'city', 'mystery', 'treasure', 'proposal', 'potion', 'halloween'));
COMMENT ON COLUMN created_quests.theme IS 'Визуальная тема плеера: detective | romantic | city | mystery | treasure | proposal | potion | halloween';
