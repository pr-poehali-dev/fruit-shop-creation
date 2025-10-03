CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_name VARCHAR(255) NOT NULL,
    site_description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    work_hours VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO site_settings (id, site_name, site_description, phone, email, address, work_hours)
VALUES (
    1,
    'Питомник растений',
    'Плодовые и декоративные культуры высокого качества',
    '+7 (495) 123-45-67',
    'info@plantsnursery.ru',
    'Московская область, г. Пушкино, ул. Садовая, 15',
    'Пн-Вс: 9:00 - 19:00'
)
ON CONFLICT (id) DO NOTHING;