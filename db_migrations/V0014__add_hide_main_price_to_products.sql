-- Добавление поля hide_main_price в таблицу products
ALTER TABLE products ADD COLUMN IF NOT EXISTS hide_main_price BOOLEAN DEFAULT false;

-- Комментарий
COMMENT ON COLUMN products.hide_main_price IS 'Скрывать основную цену и показывать только цены вариантов';