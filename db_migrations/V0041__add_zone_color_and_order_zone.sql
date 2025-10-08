-- Add color and delivery_zone_id fields
ALTER TABLE delivery_zones 
ADD COLUMN IF NOT EXISTS zone_color VARCHAR(7) DEFAULT '#3b82f6';

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS delivery_zone_id INTEGER REFERENCES delivery_zones(id);