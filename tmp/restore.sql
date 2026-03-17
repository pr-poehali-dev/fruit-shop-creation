-- ============================================================
-- FULL DATA RESTORE SCRIPT
-- Generated for: docker compose exec postgres psql -U <user> -d <db> -f /tmp/restore.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. TRUNCATE TABLES (order matters due to foreign keys)
-- ============================================================
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE product_variants CASCADE;

-- ============================================================
-- 2. INSERT USERS (29 users)
-- Columns: id, phone, password, full_name, is_admin, created_at,
--          balance, cashback, google_id, banned, ban_reason, ban_until,
--          avatar, is_super_admin, admin_permissions, referred_by_code,
--          is_courier, snow_effect_enabled
-- ============================================================
INSERT INTO users (id, phone, password, full_name, is_admin, created_at, balance, cashback, google_id, banned, ban_reason, ban_until, avatar, is_super_admin, admin_permissions, referred_by_code, is_courier, snow_effect_enabled) VALUES
(1, '+7 (999) 123-45-67', 'admin123', 'Иван Иванов', false, '2025-10-03 10:39:59.669847', 8710.00, 599.30, NULL, false, NULL, NULL, '😊', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(2, '+7 (905) 929-30-40', '$2b$12$DK2p1H0unPCbB4BJzp8GKeRab2IsQywAA8ADznF/LiNUE5wSh6Ki.', 'Вадим', true, '2025-10-04 07:26:35.300326', 27083.00, 658.53, NULL, false, NULL, NULL, 'https://i.pinimg.com/736x/f8/6a/71/f86a712bd669bc06fd3b9d2c32fc55c7.jpg', true, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, true, false),
(3, '+7 (926) 555-22-33', '12345', 'Катя', false, '2025-10-04 12:15:01.869584', 300.00, 90.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(4, '+7 (996) 701-53-66', '$2b$12$0yz5SgDhRxWOUSgqK2aZ..w1h3muykp90Cl7n2vi5cvtyEg8K6LSS', 'Афина Кириятова', false, '2025-10-04 17:11:22.376735', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(5, '+7 (902) 746-80-90', '$2b$12$2UrJyUrGxj9Oxd2RDOycF.sS6Fq1aiALSL4IfPG8xDAGztvQ4aQu6', 'Афина Кириятова', false, '2025-10-04 17:40:08.162324', 0.00, 0.00, NULL, true, 'Спам', '2025-12-13 17:45:17.334647', '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(6, '+7 (900) 000-00-01', 'testpass123', 'Тестовый Юзер', false, '2025-10-05 11:59:50.558204', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(7, '+7 (983) 106-44-71', 'vlad123', 'Влад', false, '2025-10-05 13:28:00.203014', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(8, '+7 (999) 999-99-99', 'pdL-H99-shH-S9y', 'Бабкен Вороздат Вороздат', false, '2025-10-17 09:53:02.811458', 0.00, 0.00, NULL, false, NULL, NULL, '😎', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(9, '+7 (999) 999-99-91', 'pdL-H99-shH-S9y', 'Бабкен Вороздат Вороздат', false, '2025-10-17 09:53:53.382305', 0.00, 0.00, NULL, true, 'Спам', '3166-09-30 07:42:50.823058', '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(10, '+7 (345) 345-43-64', '12345', 'амонгус', false, '2025-10-17 10:59:51.896406', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(11, '+7 (234) 534-54-35', '123123', 'arbuz', false, '2025-10-19 00:22:43.325324', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(12, '+79991234567', '', 'Иван Тестовый', false, '2025-10-19 05:55:14.530293', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(13, '+7 (991) 507-62-31', '57863425', 'Афина ', true, '2025-10-23 12:52:46.985288', 10.00, 127.50, NULL, false, NULL, NULL, '👤', true, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(14, '+7 (910) 669-75-48', '1qaz2wsx', 'Роман', false, '2025-10-23 16:05:17.564296', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(15, '+7 (905) 555-31-55', 'password''', 'Ivan', false, '2025-10-25 09:26:44.911695', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings']::text[], NULL, false, true),
(16, '+7 (910) 162-00-73', '$2b$12$cRR2suRN6HQ.3TdhI.iCSurK8DaZfrKehsnHtkZA8nuF8ZtEQ6g/u', 'Анастасия Бобр', false, '2025-10-29 19:26:56.983339', 4800.00, 12.00, NULL, false, NULL, NULL, '👤', false, ARRAY['users','orders','delivery-zones','loyalty','support']::text[], NULL, false, true),
(17, '+7 (999) 111-11-11', '$2b$12$o3DLXwLdkJt87HxVxcZ4/O8evBBmQ53dufu6wJqd1utPa8xTqIF6q', 'Максим', false, '2025-11-01 05:55:02.684714', 10.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(18, '+7 (983) 393-13-54', '$2b$12$EOwX9podiJLPBHc6AFZHp.IZZRKSYQmFuf6ABYySPn7zsi79eK1fq', 'Иван Васильевич Баяндин', false, '2025-11-03 18:51:12.276683', 0.00, 0.00, NULL, false, NULL, NULL, '🧑‍💻', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(19, '+7 (123) 123-12-31', '$2b$12$qamM/S5BjNxep3tsJxaFNOduIj22DReLyIB75zxHh1iIq1/UwxNAi', 'brr brr patapim', false, '2025-11-07 20:27:26.120377', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(20, '+7 (983) 383-97-62', '$2b$12$r3020zvljfqC2EPd2g9E3ej9VIRQ.FXkjQ2s3KqFCyhs8fWEmgJxq', 'Бакулина Анастасия', false, '2025-11-15 05:05:36.353876', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(21, '+7 (953) 990-95-25', '$2b$12$JezjZABB.agIN20Vmdh6tO/w4Q2B8SZDoOECbFjtAFKffFDqZUsVG', 'Галина ', false, '2025-11-15 05:05:54.650508', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(22, '+7 (996) 701-53-65', '$2b$12$4GA8gtsbt2bHeUB5fmXKbueqA50ts7xA1meb9tqOTgTToyPI2G0iC', 'Иван Гусев ', false, '2025-11-15 16:28:01.106093', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(23, '+7 (995) 633-12-52', '$2b$12$hJepIdC4v6K57wtFltAKyuLSkeYWLdTnGpMLZapiDTMjn2m3RqtDC', 'Влад', false, '2025-11-18 07:33:07.785123', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(24, '+7 (909) 506-77-09', '$2b$12$qJkjXDY1GltkwyIwxvWvvuNTTi7qB4oGA.haRCb2CyRfLZKyMjkdq', 'Виктория', false, '2025-11-20 12:32:10.187244', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(25, '+7 (903) 910-64-00', '$2b$12$e2RD7YfDeYMA34ABVxY.YOwd5cFwoPJhxdsZmuyg92G1nKsBHgN/G', 'Дмитрий', false, '2025-11-21 08:48:30.98736', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(26, '+7 (996) 111-11-11', '$2b$12$e0yqhF6vZbIjQNqzrEIShODeFEwivSbY.XESY0ahh76y/xcZUfnNW', 'Гоша Куценко', false, '2025-11-27 06:59:40.902873', 3000.00, 30.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(27, '+7 (962) 808-33-33', '$2b$12$fzA77j3QjuesuKwo1ep5B.db3gxIQRpOEqXDuaXCjW4c6NRRJXrpS', 'Анна Гайдукова', false, '2026-01-04 07:44:24.714074', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(28, '+7 (996) 708-57-65', '$2b$12$Lvxtq0eM3PvGrpZp.b9xH.VL7lL5QRnc4hnn4yFweuUmW5hkbqpWW', 'Афина ', false, '2026-01-07 08:49:05.754678', 0.00, 0.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true),
(29, '+7 (555) 555-55-55', '$2b$12$23wdsaTzupJNOWQA0vGGae0DRiUTaxOH.aVOWiHwdoywsa/Ya1Dky', '555555555555555555', false, '2026-01-24 20:20:55.501834', 200.00, 240.00, NULL, false, NULL, NULL, '👤', false, ARRAY['products','categories','plants','users','orders','delivery-zones','loyalty','gallery','pages','codes','settings','support']::text[], NULL, false, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. CATEGORIES - SKIPPED (inserted separately)
-- ============================================================

-- ============================================================
-- 4. INSERT PRODUCTS
-- Columns: id, name, slug, description, price, image_url, category_id,
--          stock, is_active, created_at, updated_at, show_stock,
--          hide_main_price, expected_date, is_popular
-- ============================================================
INSERT INTO products (id, name, slug, description, price, image_url, category_id, stock, is_active, created_at, updated_at, show_stock, hide_main_price, expected_date, is_popular) VALUES
(1, 'Яблоня Медуница', 'apple-antonovka', 'Классический русский сорт с кисло-сладкими плодами', 1200.00, 'https://avatars.mds.yandex.net/i?id=b84683bb6a7d5f1fb108ef8ab2dd4756_l-4245139-images-thumbs&n=13', 1, 15, true, '2025-10-03 10:41:48.077975', '2025-10-04 15:07:36.393028', true, true, NULL, false),
(4, 'Яблоня Мелба', 'thuja-occidentalis', 'Высота 3-4м, летнее, 100-200г, хранятся 2 месяца, прекрасного десертного конфетного вкуса', 680.00, 'https://экоферма22.рф/wp-content/uploads/2023/10/YAblonya-Melba.jpeg', 1, 25, true, '2025-10-03 10:41:48.077975', '2025-10-04 14:47:02.210118', true, true, NULL, false),
(7, 'Лимон "Павловский"', 'лимон-обыкновенный-', 'Домашний лимон — это вечнозеленое цитрусовое дерево, которое в комнатных условиях вырастает до 1,5-2,5 метров с раскидистой кроной. Он имеет глянцевые, темно-зеленые листья с приятным ароматом, белые или кремовые цветы и ярко-желтые, сочные, ароматные плоды, которые созревают 8-9 месяцев. Помимо украшения интерьера, лимон очищает воздух от болезнетворных микроорганизмов и придает ему свежесть. Возраст 1 год.', 450.00, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdE-eP6rtUeGqmxQZfYvd_dZHIbd5I5o2oqbwRbswzMQ&s=10', 5, NULL, true, '2025-10-05 03:36:38.869073', '2025-11-21 10:12:53.718626', false, false, NULL, true),
(8, 'Яблоня Смугляночка', 'яблоня-смугляночка', 'Высота 3-4м, летнее, 40-60г, хранятся 2 месяца, сладкое, урожайное, мякоть с розовыми прожилками, раннее плодоношение, универсальное', 600.00, 'https://i.pinimg.com/736x/33/c8/48/33c848fbaa2c1e3ddcca0e9797939a63.jpg', 1, NULL, true, '2025-10-19 15:53:55.122955', '2025-10-19 16:15:12.662475', false, true, NULL, false),
(9, 'Яблоня Юнга', 'яблоня-юнга', 'Высота 2-3м, летнее, 50-110г, хранятся месяц, мякоть жёлтая прозрачная сочная отличного вкуса практически без кислинки', 600.00, 'https://avatars.mds.yandex.net/get-mpic/1925870/2a00000191d7298633d5e28c94bc1f880b77/orig', 1, NULL, true, '2025-10-19 15:59:15.894846', '2025-10-19 16:15:05.277234', true, true, NULL, false),
(10, 'Яблоня Аппорт', 'яблоня-аппорт', 'Высота 5-6м, осеннее, 150-350г, хранятся 6 месяцев, сладкое с кислинкой, аромотное, урожайное, не осыпается, универсальное', 600.00, 'https://media.baamboozle.com/uploads/images/314555/1674118017_1707007_gif-url.jpeg', 1, NULL, true, '2025-10-19 16:12:29.438009', '2025-10-19 16:14:58.476829', true, true, NULL, false),
(11, 'Яблоня Заветное', 'яблоня-заветное', 'Высота 3-4м, осеннее, 50-100г, хранятся 5 месяцев, регулярное плодоношение, неповторимый земляничный вкус, скороплодное', 600.00, 'https://i.pinimg.com/736x/36/b7/a7/36b7a7da18e92108752d17ffc55fd81d.jpg', 1, NULL, true, '2025-10-19 16:14:29.358448', '2025-10-19 16:14:52.231855', true, true, NULL, false),
(12, 'Яблоня Павлуша', 'яблоня-павлуша', 'Высота 4-5м, осеннее, 60-150г, хранятся 3 месяца, урожайное, кисло-сладкие с сильным ароматом, сочная кремовая мякоть, универсальное', 600.00, 'https://cdn1.ozone.ru/s3/multimedia-y/6718101730.jpg', 1, NULL, true, '2025-10-19 16:27:54.354088', '2025-10-23 09:06:04.692430', false, true, NULL, false),
(13, 'Яблоня Подарок Садоводам', 'яблоня-подарок-садоводам', 'Высота 4-5м, осеннее, 60-100г, хранятся 4 месяца, урожайное, кисло-сладкие с яблочным ароматом, сочная мелкозернистая мякоть', 600.00, 'https://liubimyi-sad.ru/wp-content/uploads/2024/02/yablonya-kolonovidnaya-patriot-3.jpeg', 1, NULL, true, '2025-10-19 16:29:36.012427', '2025-10-19 16:32:09.664850', true, true, NULL, false),
(14, 'Яблоня Уральское Наливное', 'яблоня-уральское-наливное', 'Высота 6-7м, осеннее, 30-50г, хранятся 2 месяца, сладкое, урожайное, без кислинки, раннее плодоношение, универсальное', 600.00, 'https://avatars.mds.yandex.net/i?id=25716491b924519acde3e0fc12aaa274b3090fbf-5173519-images-thumbs&n=13', 1, NULL, true, '2025-10-19 16:31:35.567010', '2025-10-19 16:32:15.471138', true, true, NULL, false),
(15, 'Яблоня Алтайское Зимнее', 'яблоня-алтайское-зимнее', 'Высота 4-5м, зимнее, 80-120г, хранятся 5 месяцев, белая сочная мякоть кисло-сладкого хорошего вкуса', 600.00, 'https://avatars.mds.yandex.net/i?id=453a36ee611637cd9e98b64e3b68d252a67b71be-11492537-images-thumbs&n=13', 1, NULL, true, '2025-10-20 06:34:36.951734', '2025-10-20 06:34:36.951734', true, true, NULL, false),
(16, 'Яблоня Краса Свердловска', 'яблоня-краса-свердловска', 'Высота 4-5м, зимнее, 120-200г, хранятся 6 месяцев, урожайное, кисло-сладкие с пряностью и ароматом, отличного вкуса улучшающегося с хранением', 600.00, 'https://avatars.mds.yandex.net/i?id=8783617604d9a83b71fc2a8c02279a40_l-5210344-images-thumbs&n=13', 1, NULL, true, '2025-10-20 06:36:33.915087', '2025-10-20 06:38:12.591763', true, true, NULL, false),
(17, 'Яблоня Память Воину', 'яблоня-память-воину', 'Высота 3-4м, зимнее, 100-200г, хранятся 6 месяцев, урожайное, кисло-сладкие, очень нежная и сочная мякоть с розовыми прожилками', 599.98, 'https://avatars.mds.yandex.net/i?id=e5bd47ca341da3669f5ea949d1f5612d645b9d6f-4529499-images-thumbs&n=13', 1, NULL, true, '2025-10-20 06:37:45.386054', '2025-10-20 06:37:45.386054', true, true, NULL, false),
(18, 'Яблоня Спартан', 'яблоня-спартан', 'Высота 4-5м, зимнее, 90-120г, хранятся 6 месяцев, урожайное, сладкие без кислинки, сочные, ароматные плоды', 600.00, 'https://avatars.mds.yandex.net/i?id=331640737878e548b7a13c924db2d7ad_l-8194143-images-thumbs&n=13', 1, NULL, true, '2025-10-20 06:39:23.477592', '2025-10-20 06:39:23.477592', true, true, NULL, false),
(19, 'Яблоня Спутник', 'яблоня-спутник', 'Высота 4-5м, зимнее, 100-150г, хранятся 5 месяцев, урожайное, кисло-сладкие приятного вкуса, плотная мякоть', 599.98, 'https://static.insales-cdn.com/images/products/1/4837/811021029/e80d17fe8255a1c9425189f330a4c650.jpeg', 1, NULL, true, '2025-10-20 06:41:38.074202', '2025-10-20 06:41:38.074202', true, true, NULL, false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 5. INSERT PRODUCT_VARIANTS
-- NOTE: Variant row data (IDs 1-42, 49-53, 72-74) was referenced
--       but actual values were not provided in the restore data.
--       Add variant INSERT statements here when data is available.
-- Columns: id, product_id, size, price, stock, sort_order, created_at
-- ============================================================
-- TODO: INSERT INTO product_variants (id, product_id, size, price, stock, sort_order, created_at) VALUES ...

-- ============================================================
-- 6. UPDATE SITE_SETTINGS (id=1)
-- ============================================================
UPDATE site_settings SET
    site_name = 'Сад мечты',
    site_description = 'Плодовые и декоративные культуры высокого качества',
    phone = '+7 (905) 929-30-40',
    email = 'info@plantsnursery.ru',
    address = 'Московская область, г. Пушкино, ул. Садовая, 15',
    work_hours = 'Пн-Вс: 9:00 - 19:00',
    delivery_title = 'Доставка и оплата',
    delivery_courier_title = 'Курьерская доставка',
    delivery_courier_text = 'По Барнаулу — 500 ₽, на комнатные растения предзаказ не распространяется.',
    delivery_transport_title = 'Транспортная компания',
    delivery_transport_text = 'По России — рассчитывается индивидуально',
    delivery_pickup_title = 'Самовывоз',
    delivery_pickup_text = 'На данный момент нету',
    payment_title = 'Способы оплаты',
    loyalty_card_price = 600.00,
    loyalty_unlock_amount = 5000.00,
    loyalty_cashback_percent = 5.00,
    balance_payment_cashback_percent = 5.00,
    delivery_enabled = true,
    delivery_price = 600.00,
    free_delivery_min = 3000.00,
    pickup_enabled = false,
    preorder_enabled = false,
    preorder_message = 'Предзаказ на весну 2026. Доставка с марта по май 2026 года.',
    show_online_counter = true,
    online_boost = 15,
    admin_pin = '0000',
    logo_url = 'https://sun9-77.userapi.com/s/v1/ig2/5XfK1JxUWfopWDG3X_S73-nLTHlA9-6PPzXj-6xAFUTBFODuKFMFW1EgQTkgYmaI2MwZ2pST5v3iAC-lEwS8CPFd.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080&from=bu&cs=1080x0',
    alfabank_login = 'r-siberian_florarium-ap',
    alfabank_password = '7pui6mfp6eanpr0ucrmsj6lpsq'
WHERE id = 1;

-- ============================================================
-- 7. RESET SEQUENCES
-- ============================================================
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));
SELECT setval('product_variants_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_variants));

-- ============================================================
-- 8. COMMIT
-- ============================================================
COMMIT;
