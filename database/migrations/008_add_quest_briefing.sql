-- Текст автора «Перед стартом»: что взять, как одеться, куда ехать.
-- Плеер показывает его в сводке до первого блока.
ALTER TABLE created_quests
  ADD COLUMN IF NOT EXISTS briefing TEXT;

COMMENT ON COLUMN created_quests.briefing IS 'Текст автора для сводки перед стартом: что взять, как одеться, куда ехать';
