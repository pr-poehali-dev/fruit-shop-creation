-- Добавляем баланс и кэшбек пользователям
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cashback DECIMAL(10, 2) DEFAULT 0.00;

-- Создаем таблицу транзакций для истории операций с балансом
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);