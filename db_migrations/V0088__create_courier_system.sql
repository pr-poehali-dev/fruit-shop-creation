-- Add courier role to users table
ALTER TABLE t_p77282076_fruit_shop_creation.users 
ADD COLUMN IF NOT EXISTS is_courier BOOLEAN DEFAULT FALSE;

-- Add courier assignment to orders
ALTER TABLE t_p77282076_fruit_shop_creation.orders 
ADD COLUMN IF NOT EXISTS courier_id INTEGER REFERENCES t_p77282076_fruit_shop_creation.users(id),
ADD COLUMN IF NOT EXISTS courier_assigned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS courier_delivered_at TIMESTAMP;

-- Create courier_earnings table
CREATE TABLE IF NOT EXISTS t_p77282076_fruit_shop_creation.courier_earnings (
    id SERIAL PRIMARY KEY,
    courier_id INTEGER NOT NULL REFERENCES t_p77282076_fruit_shop_creation.users(id),
    order_id INTEGER NOT NULL REFERENCES t_p77282076_fruit_shop_creation.orders(id),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 250.00,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_out BOOLEAN DEFAULT FALSE,
    paid_out_at TIMESTAMP,
    UNIQUE(order_id)
);

-- Create index for courier queries
CREATE INDEX IF NOT EXISTS idx_orders_courier_id ON t_p77282076_fruit_shop_creation.orders(courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_earnings_courier_id ON t_p77282076_fruit_shop_creation.courier_earnings(courier_id);

COMMENT ON TABLE t_p77282076_fruit_shop_creation.courier_earnings IS 'Учёт заработка курьеров по заказам';
COMMENT ON COLUMN t_p77282076_fruit_shop_creation.courier_earnings.amount IS 'Сумма за доставку (по умолчанию 250₽)';
COMMENT ON COLUMN t_p77282076_fruit_shop_creation.users.is_courier IS 'Роль курьера для доступа к системе доставки';