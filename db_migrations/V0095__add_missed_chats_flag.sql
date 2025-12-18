-- Добавляем поле is_missed для отметки пропущенных чатов
ALTER TABLE t_p77282076_fruit_shop_creation.archived_chats 
ADD COLUMN IF NOT EXISTS is_missed BOOLEAN DEFAULT false;

-- Создаем индекс для быстрого поиска пропущенных чатов
CREATE INDEX IF NOT EXISTS idx_archived_chats_missed 
ON t_p77282076_fruit_shop_creation.archived_chats(is_missed, closed_at DESC) 
WHERE is_missed = true;