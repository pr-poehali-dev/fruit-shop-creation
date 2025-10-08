-- Добавление поля для минимальной суммы бесплатной доставки
ALTER TABLE t_p77282076_fruit_shop_creation.site_settings 
ADD COLUMN free_delivery_min DECIMAL(10, 2) DEFAULT 3000.00;

-- Устанавливаем значение по умолчанию для существующих записей
UPDATE t_p77282076_fruit_shop_creation.site_settings 
SET free_delivery_min = 3000.00 
WHERE free_delivery_min IS NULL;