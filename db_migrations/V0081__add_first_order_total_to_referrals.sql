-- Add first_order_total column to track the amount of the first order
ALTER TABLE t_p77282076_fruit_shop_creation.referrals 
ADD COLUMN IF NOT EXISTS first_order_total NUMERIC(10,2) DEFAULT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON t_p77282076_fruit_shop_creation.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON t_p77282076_fruit_shop_creation.referrals(referred_id);
