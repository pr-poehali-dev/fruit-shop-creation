-- Таблица для хранения архивных чатов после их закрытия
CREATE TABLE IF NOT EXISTS t_p77282076_fruit_shop_creation.archived_chats (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER NOT NULL,
  user_id INTEGER,
  user_name VARCHAR(255),
  user_phone VARCHAR(50),
  admin_id INTEGER,
  admin_name VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  messages_json TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_guest BOOLEAN DEFAULT false,
  guest_id VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_archived_chats_chat_id ON t_p77282076_fruit_shop_creation.archived_chats(chat_id);
CREATE INDEX IF NOT EXISTS idx_archived_chats_admin_id ON t_p77282076_fruit_shop_creation.archived_chats(admin_id);
CREATE INDEX IF NOT EXISTS idx_archived_chats_closed_at ON t_p77282076_fruit_shop_creation.archived_chats(closed_at);