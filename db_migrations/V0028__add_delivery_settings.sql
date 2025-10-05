-- Добавляем поля для настройки доставки
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS delivery_price NUMERIC(10,2) DEFAULT 0;

-- Добавляем поле типа доставки в заказы
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'pickup';

COMMENT ON COLUMN site_settings.delivery_enabled IS 'Включена ли доставка на сайте';
COMMENT ON COLUMN site_settings.delivery_price IS 'Стоимость доставки';
COMMENT ON COLUMN orders.delivery_type IS 'Тип доставки: pickup (самовывоз) или delivery (доставка)';