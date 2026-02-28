-- Добавить поле newsletter_consent в таблицу orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS newsletter_consent BOOLEAN DEFAULT false;

-- Комментарий
COMMENT ON COLUMN orders.newsletter_consent IS 'Согласие клиента на получение рассылки';