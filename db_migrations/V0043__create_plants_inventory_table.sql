CREATE TABLE IF NOT EXISTS t_p77282076_fruit_shop_creation.plants_inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latin_name VARCHAR(255),
    category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'шт',
    price DECIMAL(10, 2),
    supplier VARCHAR(255),
    location VARCHAR(255),
    notes TEXT,
    pdf_source VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plants_name ON t_p77282076_fruit_shop_creation.plants_inventory(name);
CREATE INDEX idx_plants_category ON t_p77282076_fruit_shop_creation.plants_inventory(category);
