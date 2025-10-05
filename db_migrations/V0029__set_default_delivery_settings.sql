-- Установка значений по умолчанию для существующих записей
UPDATE site_settings 
SET delivery_enabled = true, delivery_price = 0 
WHERE delivery_enabled IS NULL OR delivery_price IS NULL;