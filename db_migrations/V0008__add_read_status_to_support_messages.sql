ALTER TABLE support_messages
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_unread 
ON support_messages(ticket_id, is_read) WHERE is_admin = TRUE;