-- Добавление срока действия для карт лояльности (6 месяцев)
ALTER TABLE t_p77282076_fruit_shop_creation.loyalty_cards 
ADD COLUMN expires_at TIMESTAMP;

-- Установка срока действия для существующих карт (6 месяцев с даты покупки)
UPDATE t_p77282076_fruit_shop_creation.loyalty_cards 
SET expires_at = purchased_at + INTERVAL '6 months'
WHERE expires_at IS NULL;

-- Деактивация просроченных карт
UPDATE t_p77282076_fruit_shop_creation.loyalty_cards 
SET is_active = false
WHERE expires_at < NOW() AND is_active = true;