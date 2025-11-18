ALTER TABLE t_p77282076_fruit_shop_creation.site_settings 
ADD COLUMN IF NOT EXISTS show_online_counter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS online_boost INTEGER DEFAULT 0;