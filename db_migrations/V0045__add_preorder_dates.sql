ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS preorder_start_date DATE,
ADD COLUMN IF NOT EXISTS preorder_end_date DATE;