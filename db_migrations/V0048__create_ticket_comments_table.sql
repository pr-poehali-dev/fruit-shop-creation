CREATE TABLE t_p77282076_fruit_shop_creation.ticket_comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES t_p77282076_fruit_shop_creation.support_tickets(id),
    user_id INTEGER NOT NULL REFERENCES t_p77282076_fruit_shop_creation.users(id),
    comment TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_comments_ticket_id ON t_p77282076_fruit_shop_creation.ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created_at ON t_p77282076_fruit_shop_creation.ticket_comments(created_at);