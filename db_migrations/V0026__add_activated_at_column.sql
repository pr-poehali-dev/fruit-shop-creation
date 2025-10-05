-- Добавляем колонку activated_at
ALTER TABLE t_p77282076_fruit_shop_creation.loyalty_cards 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP DEFAULT NOW();

-- Заполняем activated_at для существующих карт из purchased_at
UPDATE t_p77282076_fruit_shop_creation.loyalty_cards 
SET activated_at = purchased_at 
WHERE activated_at IS NULL;