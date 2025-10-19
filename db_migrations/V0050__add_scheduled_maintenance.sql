-- Add scheduled maintenance columns to site_settings table
ALTER TABLE t_p77282076_fruit_shop_creation.site_settings 
ADD COLUMN IF NOT EXISTS maintenance_start_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS maintenance_end_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS auto_maintenance_enabled BOOLEAN DEFAULT FALSE;