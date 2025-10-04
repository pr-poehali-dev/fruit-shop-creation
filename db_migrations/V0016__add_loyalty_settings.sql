-- Добавляем поля для управления картой лояльности и кэшбеком
ALTER TABLE t_p77282076_fruit_shop_creation.site_settings 
ADD COLUMN IF NOT EXISTS loyalty_unlock_amount DECIMAL(10,2) DEFAULT 5000.00,
ADD COLUMN IF NOT EXISTS loyalty_cashback_percent DECIMAL(5,2) DEFAULT 5.00;

COMMENT ON COLUMN t_p77282076_fruit_shop_creation.site_settings.loyalty_unlock_amount IS 'Сумма покупок для автоматического получения карты лояльности';
COMMENT ON COLUMN t_p77282076_fruit_shop_creation.site_settings.loyalty_cashback_percent IS 'Процент кэшбека по карте лояльности';