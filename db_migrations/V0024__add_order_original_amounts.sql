-- Добавляем поля для хранения исходных сумм при создании заказа
ALTER TABLE orders 
ADD COLUMN cashback_earned DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN amount_paid DECIMAL(10, 2) DEFAULT 0;

-- Обновляем существующие заказы (считаем что они были с балансом и кэшбеком 5%)
UPDATE orders 
SET cashback_earned = total_amount * 0.05,
    amount_paid = total_amount
WHERE payment_method = 'balance';