-- Добавляем колонку для назначенного администратора
ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets 
ADD COLUMN IF NOT EXISTS assigned_admin_id INTEGER REFERENCES t_p77282076_fruit_shop_creation.users(id);

-- Обновляем enum статусов (через recreate constraint)
ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets 
ALTER COLUMN status TYPE VARCHAR(50);

-- Добавляем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tickets_status ON t_p77282076_fruit_shop_creation.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_admin ON t_p77282076_fruit_shop_creation.support_tickets(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON t_p77282076_fruit_shop_creation.ticket_comments(ticket_id);

-- Добавляем колонку для отслеживания времени взятия тикета
ALTER TABLE t_p77282076_fruit_shop_creation.support_tickets 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;