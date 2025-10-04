-- Создание таблицы для карт лояльности
CREATE TABLE IF NOT EXISTS loyalty_cards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    card_number VARCHAR(50) UNIQUE NOT NULL,
    qr_code TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Добавление настройки стоимости карты лояльности в settings
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS loyalty_card_price DECIMAL(10,2) DEFAULT 500.00;

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_card_number ON loyalty_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_user_id ON loyalty_cards(user_id);