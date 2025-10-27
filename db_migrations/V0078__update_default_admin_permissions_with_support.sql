-- Обновляем DEFAULT для admin_permissions, чтобы включить поддержку
ALTER TABLE t_p77282076_fruit_shop_creation.users 
ALTER COLUMN admin_permissions 
SET DEFAULT ARRAY['products', 'categories', 'plants', 'users', 'orders', 'delivery-zones', 'loyalty', 'gallery', 'pages', 'codes', 'settings', 'support']::TEXT[];