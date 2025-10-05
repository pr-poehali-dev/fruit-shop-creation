-- Добавляем поле для отметки товара как недоступного в заказе
ALTER TABLE t_p77282076_fruit_shop_creation.order_items 
ADD COLUMN is_out_of_stock BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN t_p77282076_fruit_shop_creation.order_items.is_out_of_stock IS 'Флаг отсутствия товара на складе при обработке заказа';