-- Rename courier_request_fee to courier_delivery_price
ALTER TABLE site_settings 
RENAME COLUMN courier_request_fee TO courier_delivery_price;