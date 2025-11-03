-- Добавление поля is_popular для отображения товара в популярных
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;

-- Создание индекса для быстрой фильтрации популярных товаров
CREATE INDEX IF NOT EXISTS idx_products_is_popular ON products(is_popular) WHERE is_popular = TRUE;