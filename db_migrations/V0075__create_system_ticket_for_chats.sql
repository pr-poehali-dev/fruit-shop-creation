-- Создать системный тикет для чатов (если его нет)
INSERT INTO t_p77282076_fruit_shop_creation.support_tickets (id, user_id, subject, status, message, created_at, updated_at)
SELECT 1, 1, 'Системный тикет для чатов', 'open', 'Автоматически созданный тикет для системы чатов с ботом Анфиса', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM t_p77282076_fruit_shop_creation.support_tickets WHERE id = 1);

-- Установить следующее значение последовательности ID
SELECT setval('t_p77282076_fruit_shop_creation.support_tickets_id_seq', GREATEST(1, (SELECT MAX(id) FROM t_p77282076_fruit_shop_creation.support_tickets)));