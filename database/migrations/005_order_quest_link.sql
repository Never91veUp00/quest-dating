-- Добавляем created_quest_id в orders если нет
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_quest_id INTEGER REFERENCES created_quests(id) ON DELETE SET NULL;

-- Проверяем и заполняем по существующим связям
UPDATE orders o
SET created_quest_id = cq.id
FROM created_quests cq
WHERE cq.order_id = o.id
  AND o.created_quest_id IS NULL;