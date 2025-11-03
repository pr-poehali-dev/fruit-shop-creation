-- Таблица для отслеживания онлайн статуса администраторов
CREATE TABLE IF NOT EXISTS admin_online_status (
    user_id INTEGER PRIMARY KEY REFERENCES users(id),
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для чата администраторов
CREATE TABLE IF NOT EXISTS admin_chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_admin_chat_created_at ON admin_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_online_status_last_seen ON admin_online_status(last_seen DESC);