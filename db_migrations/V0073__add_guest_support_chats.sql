-- Добавляем поле для идентификации гостевых чатов
ALTER TABLE t_p77282076_fruit_shop_creation.support_chats 
ADD COLUMN IF NOT EXISTS guest_id VARCHAR(255);

-- Индекс для быстрого поиска гостевых чатов
CREATE INDEX IF NOT EXISTS idx_support_chats_guest_id ON t_p77282076_fruit_shop_creation.support_chats(guest_id);
