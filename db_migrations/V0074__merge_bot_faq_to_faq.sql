-- Переносим данные из старой таблицы bot_faq в новую faq (если нужно)
-- Проверяем какие вопросы уникальны в bot_faq
INSERT INTO t_p77282076_fruit_shop_creation.faq (question, answer, keywords)
SELECT 
    bfaq.question,
    bfaq.answer,
    ARRAY['заказ', 'минимум', 'сумма', 'доставка']
FROM t_p77282076_fruit_shop_creation.bot_faq bfaq
WHERE bfaq.question = 'Какая минимальная сумма заказа?'
AND NOT EXISTS (
    SELECT 1 FROM t_p77282076_fruit_shop_creation.faq 
    WHERE question = 'Какая минимальная сумма заказа?'
);

INSERT INTO t_p77282076_fruit_shop_creation.faq (question, answer, keywords)
SELECT 
    bfaq.question,
    bfaq.answer,
    ARRAY['лояльность', 'карта', 'кэшбек', 'бонусы', 'скидка']
FROM t_p77282076_fruit_shop_creation.bot_faq bfaq
WHERE bfaq.question = 'Как работает программа лояльности?'
AND NOT EXISTS (
    SELECT 1 FROM t_p77282076_fruit_shop_creation.faq 
    WHERE question = 'Как работает программа лояльности?'
);

INSERT INTO t_p77282076_fruit_shop_creation.faq (question, answer, keywords)
SELECT 
    bfaq.question,
    bfaq.answer,
    ARRAY['саженцы', 'возраст', 'лет', 'растения']
FROM t_p77282076_fruit_shop_creation.bot_faq bfaq
WHERE bfaq.question = 'Сколько лет саженцам?'
AND NOT EXISTS (
    SELECT 1 FROM t_p77282076_fruit_shop_creation.faq 
    WHERE question = 'Сколько лет саженцам?'
);

-- Обновляем вопрос "Как сделать заказ?" на более подробный ответ из bot_faq
UPDATE t_p77282076_fruit_shop_creation.faq 
SET answer = 'Выберите товары из каталога, добавьте их в корзину и нажмите "Оформить заказ". Заполните данные доставки и выберите способ оплаты.'
WHERE question = 'Как сделать заказ?';
