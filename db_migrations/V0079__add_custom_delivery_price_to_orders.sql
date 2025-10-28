-- Добавляем поле для кастомной цены доставки
ALTER TABLE t_p77282076_fruit_shop_creation.orders 
ADD COLUMN custom_delivery_price NUMERIC(10,2) DEFAULT NULL,
ADD COLUMN delivery_price_set_by_admin BOOLEAN DEFAULT FALSE;