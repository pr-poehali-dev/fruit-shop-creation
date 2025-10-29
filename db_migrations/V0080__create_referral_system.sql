-- Создание таблицы для реферальных кодов пользователей
CREATE TABLE IF NOT EXISTS t_p77282076_fruit_shop_creation.referral_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p77282076_fruit_shop_creation.users(id),
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы для отслеживания рефералов
CREATE TABLE IF NOT EXISTS t_p77282076_fruit_shop_creation.referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES t_p77282076_fruit_shop_creation.users(id),
    referred_id INTEGER NOT NULL REFERENCES t_p77282076_fruit_shop_creation.users(id),
    referral_code VARCHAR(20) NOT NULL,
    reward_amount NUMERIC(10,2) DEFAULT 500.00,
    reward_given BOOLEAN DEFAULT FALSE,
    first_order_made BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(referred_id)
);

-- Добавление поля для реферального кода в таблицу users (откуда пришел пользователь)
ALTER TABLE t_p77282076_fruit_shop_creation.users 
ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(20);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON t_p77282076_fruit_shop_creation.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON t_p77282076_fruit_shop_creation.referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON t_p77282076_fruit_shop_creation.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON t_p77282076_fruit_shop_creation.referrals(referred_id);