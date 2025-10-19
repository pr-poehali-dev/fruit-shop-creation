ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets
    ADD COLUMN IF NOT EXISTS ticket_number VARCHAR(20);

ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets
    ADD COLUMN IF NOT EXISTS name VARCHAR(255);

ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets
    ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets
    ADD COLUMN IF NOT EXISTS category VARCHAR(50);

ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets
    ADD COLUMN IF NOT EXISTS admin_notes TEXT;

ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;

UPDATE t_p77282076_fruit_shop_creation.support_tickets
SET ticket_number = 'T' || LPAD(id::text, 6, '0')
WHERE ticket_number IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_ticket_number 
ON t_p77282076_fruit_shop_creation.support_tickets(ticket_number);
