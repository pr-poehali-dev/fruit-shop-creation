-- Добавляем начальные FAQ для бота (если их еще нет)
INSERT INTO bot_faq (question, answer)
SELECT * FROM (VALUES
    ('Как сделать заказ?', 'Выберите растения в каталоге, добавьте их в корзину и оформите заказ. Мы свяжемся с вами для подтверждения!'),
    ('Какие способы оплаты?', 'Мы принимаем оплату картой онлайн и наличными при получении.'),
    ('Сколько стоит доставка?', 'Стоимость доставки зависит от адреса. Укажите адрес при оформлении заказа, и мы рассчитаем точную стоимость!'),
    ('Как ухаживать за растениями?', 'В карточке каждого растения есть подробная инструкция по уходу. Также наши специалисты всегда помогут с советами!'),
    ('Режим работы магазина?', 'Мы работаем ежедневно с 9:00 до 21:00. Заказы онлайн принимаем круглосуточно!'),
    ('Как отменить заказ?', 'Свяжитесь с нами через чат поддержки, и мы поможем отменить заказ до его отправки.')
) AS v(question, answer)
WHERE NOT EXISTS (SELECT 1 FROM bot_faq LIMIT 1);

-- Добавляем недостающие поля в support_messages для поддержки чата с ботом
ALTER TABLE support_messages 
ADD COLUMN IF NOT EXISTS chat_id INTEGER REFERENCES support_chats(id);

ALTER TABLE support_messages 
ADD COLUMN IF NOT EXISTS sender_type VARCHAR(20);

ALTER TABLE support_messages 
ADD COLUMN IF NOT EXISTS sender_id INTEGER REFERENCES users(id);

ALTER TABLE support_messages 
ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255);
