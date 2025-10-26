-- Добавляем начальные FAQ для бота Анфисы (если их еще нет)
INSERT INTO t_p77282076_fruit_shop_creation.faq (question, answer, keywords)
SELECT * FROM (VALUES
    ('Как сделать заказ?', 'Выберите растения в каталоге, добавьте их в корзину и оформите заказ. Мы свяжемся с вами для подтверждения!', ARRAY['заказ', 'купить', 'оформить', 'корзина']),
    ('Какие способы оплаты?', 'Мы принимаем оплату картой онлайн и наличными при получении.', ARRAY['оплата', 'платить', 'карта', 'наличные']),
    ('Сколько стоит доставка?', 'Стоимость доставки зависит от адреса. Укажите адрес при оформлении заказа, и мы рассчитаем точную стоимость!', ARRAY['доставка', 'стоимость', 'привезти', 'курьер']),
    ('Как ухаживать за растениями?', 'В карточке каждого растения есть подробная инструкция по уходу. Также наши специалисты всегда помогут с советами!', ARRAY['уход', 'поливать', 'выращивать', 'инструкция']),
    ('Режим работы магазина?', 'Мы работаем ежедневно с 9:00 до 21:00. Заказы онлайн принимаем круглосуточно!', ARRAY['режим', 'работа', 'время', 'график', 'открыто']),
    ('Как отменить заказ?', 'Свяжитесь с нами через чат поддержки, и мы поможем отменить заказ до его отправки.', ARRAY['отменить', 'отмена', 'вернуть'])
) AS v(question, answer, keywords)
WHERE NOT EXISTS (SELECT 1 FROM t_p77282076_fruit_shop_creation.faq LIMIT 1);

-- Добавляем недостающие поля в support_messages для поддержки чата с ботом
ALTER TABLE t_p77282076_fruit_shop_creation.support_messages 
ADD COLUMN IF NOT EXISTS chat_id INTEGER REFERENCES t_p77282076_fruit_shop_creation.support_chats(id);

ALTER TABLE t_p77282076_fruit_shop_creation.support_messages 
ADD COLUMN IF NOT EXISTS sender_type VARCHAR(20);

ALTER TABLE t_p77282076_fruit_shop_creation.support_messages 
ADD COLUMN IF NOT EXISTS sender_id INTEGER REFERENCES t_p77282076_fruit_shop_creation.users(id);

ALTER TABLE t_p77282076_fruit_shop_creation.support_messages 
ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255);
