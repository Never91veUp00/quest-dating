-- Порядок прохождения квеста: route — участки по очереди (как было),
-- board — «доска»: все участки открыты сразу, последний — финал, он открывается,
-- когда пройдены остальные. Список режимов: QUEST_FLOWS в server/src/routes/admin.js.
-- Миграция идемпотентна.
ALTER TABLE created_quests ADD COLUMN IF NOT EXISTS flow character varying(10) DEFAULT 'route' NOT NULL;
ALTER TABLE created_quests DROP CONSTRAINT IF EXISTS created_quests_flow_check;
ALTER TABLE created_quests ADD CONSTRAINT created_quests_flow_check CHECK (flow IN ('route', 'board'));
COMMENT ON COLUMN created_quests.flow IS 'Порядок прохождения: route — по очереди, board — доска, финал последним';
