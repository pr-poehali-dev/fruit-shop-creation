-- Добавляем колонку admin_pin для защиты панели администратора
ALTER TABLE t_p77282076_fruit_shop_creation.site_settings 
ADD COLUMN IF NOT EXISTS admin_pin VARCHAR(10) DEFAULT '0000';

-- Устанавливаем дефолтный PIN для существующих записей
UPDATE t_p77282076_fruit_shop_creation.site_settings 
SET admin_pin = '0000' 
WHERE admin_pin IS NULL;