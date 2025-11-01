-- Добавляем поля для отслеживания второго платежа (50% после обработки)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS second_payment_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS second_payment_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS second_payment_deadline TIMESTAMP;

-- Комментарии для понимания
COMMENT ON COLUMN orders.second_payment_paid IS 'Оплачена ли вторая часть заказа (50% после обработки)';
COMMENT ON COLUMN orders.second_payment_amount IS 'Сумма второго платежа (50% от товаров)';
COMMENT ON COLUMN orders.second_payment_deadline IS 'Дедлайн для оплаты второй части';