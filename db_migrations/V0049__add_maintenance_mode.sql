-- Add maintenance mode columns to site_settings table
ALTER TABLE t_p77282076_fruit_shop_creation.site_settings 
ADD COLUMN IF NOT EXISTS is_maintenance_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS maintenance_reason TEXT DEFAULT 'Сайт временно закрыт на техническое обслуживание';