ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS pickup_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS preorder_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preorder_message TEXT DEFAULT 'Предзаказ на весну 2026. Доставка с марта по май 2026 года.';