-- Добавляем поле admin_avatar в таблицу support_chats
ALTER TABLE t_p77282076_fruit_shop_creation.support_chats 
ADD COLUMN IF NOT EXISTS admin_avatar TEXT;

-- Добавляем поле admin_avatar в таблицу support_messages для истории
ALTER TABLE t_p77282076_fruit_shop_creation.support_messages 
ADD COLUMN IF NOT EXISTS admin_avatar TEXT;

COMMENT ON COLUMN t_p77282076_fruit_shop_creation.support_chats.admin_avatar IS 'URL аватара администратора';
COMMENT ON COLUMN t_p77282076_fruit_shop_creation.support_messages.admin_avatar IS 'URL аватара администратора для отображения в истории';