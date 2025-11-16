ALTER TABLE t_p77282076_fruit_shop_creation.product_images 
ADD COLUMN width INTEGER,
ADD COLUMN height INTEGER,
ADD COLUMN object_fit VARCHAR(20) DEFAULT 'cover';