-- Add courier request fee field to site_settings table
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS courier_request_fee DECIMAL(10,2) DEFAULT 300;