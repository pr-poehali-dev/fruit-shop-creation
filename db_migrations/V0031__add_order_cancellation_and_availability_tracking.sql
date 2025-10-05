-- Добавляем колонки для отслеживания отмены заказа
ALTER TABLE t_p77282076_fruit_shop_creation.orders 
ADD COLUMN cancelled_by VARCHAR(20),
ADD COLUMN cancellation_reason TEXT;

-- Добавляем комментарии
COMMENT ON COLUMN t_p77282076_fruit_shop_creation.orders.cancelled_by IS 'Кто отменил заказ: user или admin';
COMMENT ON COLUMN t_p77282076_fruit_shop_creation.orders.cancellation_reason IS 'Причина отмены заказа';

-- Добавляем колонки количества и цены для управления в админке
ALTER TABLE t_p77282076_fruit_shop_creation.order_items
ADD COLUMN available_quantity INTEGER DEFAULT 0,
ADD COLUMN available_price DECIMAL(10, 2);

COMMENT ON COLUMN t_p77282076_fruit_shop_creation.order_items.available_quantity IS 'Доступное количество для заказа';
COMMENT ON COLUMN t_p77282076_fruit_shop_creation.order_items.available_price IS 'Доступная цена если отличается от заказанной';