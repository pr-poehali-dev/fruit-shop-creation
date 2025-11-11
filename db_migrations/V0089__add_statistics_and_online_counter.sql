-- Таблица для статистики посещений
CREATE TABLE IF NOT EXISTS site_visits (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    referer TEXT,
    platform VARCHAR(100),
    browser VARCHAR(100),
    device_type VARCHAR(50),
    visited_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visited_at ON site_visits(visited_at);
CREATE INDEX idx_visitor_id ON site_visits(visitor_id);

-- Таблица для онлайн-активности
CREATE TABLE IF NOT EXISTS online_users (
    id SERIAL PRIMARY KEY,
    visitor_id VARCHAR(255) UNIQUE NOT NULL,
    last_activity TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_last_activity ON online_users(last_activity);

-- Добавляем настройки онлайн-счётчика в site_settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS show_online_counter BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS online_boost INTEGER DEFAULT 0 CHECK (online_boost >= 0 AND online_boost <= 300);