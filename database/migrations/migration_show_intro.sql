-- Добавляем поле show_intro в created_quests
ALTER TABLE created_quests
  ADD COLUMN IF NOT EXISTS show_intro BOOLEAN NOT NULL DEFAULT true;

-- Комментарий
COMMENT ON COLUMN created_quests.show_intro IS 'Показывать анимированную заставку перед сплэш-экраном';