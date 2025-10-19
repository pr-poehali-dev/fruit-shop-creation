-- Таблица для вопросов и ответов бота
CREATE TABLE IF NOT EXISTS bot_faq (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для изображений галереи
CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем дефолтные вопросы для бота
INSERT INTO bot_faq (question, answer, sort_order) VALUES
('Как сделать заказ?', 'Выберите товары из каталога, добавьте их в корзину и нажмите "Оформить заказ". Заполните данные доставки и выберите способ оплаты.', 1),
('Какая минимальная сумма заказа?', 'Минимальная сумма заказа не ограничена. Бесплатная доставка от 3000 ₽.', 2),
('Как работает программа лояльности?', 'Оформите карту лояльности за 500 ₽. После покупок на сумму от 5000 ₽ получайте кэшбек 4.5% от каждой покупки.', 3);

-- Вставляем текущие изображения из галереи
INSERT INTO gallery_images (image_url, title, description, sort_order) VALUES
('https://cdn.poehali.dev/projects/999e341c-34c8-439f-a5a7-6cab243ccc11/files/d0355945-8f9e-4481-b185-9c4664060422.jpg', 'Наш питомник', 'Широкий ассортимент декоративных и плодовых культур', 1),
('https://cdn.poehali.dev/projects/999e341c-34c8-439f-a5a7-6cab243ccc11/files/21628348-c6b1-44ed-943b-0f0a3fe711a5.jpg', 'Яблони в саду', 'Плодовые деревья с крупными сочными плодами', 2),
('https://cdn.poehali.dev/projects/999e341c-34c8-439f-a5a7-6cab243ccc11/files/fe15436f-8b9a-4b1d-913a-a954b3e05042.jpg', 'Цветущая вишня', 'Декоративные деревья для вашего участка', 3);