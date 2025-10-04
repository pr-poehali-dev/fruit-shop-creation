-- Добавляем поле avatar для хранения аватарки пользователя
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '👤';