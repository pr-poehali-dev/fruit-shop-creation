-- Add balance payment cashback percent to site settings
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS balance_payment_cashback_percent DECIMAL(5,2) DEFAULT 5.00;