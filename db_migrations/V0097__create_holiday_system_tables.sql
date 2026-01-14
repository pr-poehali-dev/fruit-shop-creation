-- Таблица для глобальных настроек праздников (доступна всем)
CREATE TABLE IF NOT EXISTS t_p77282076_fruit_shop_creation.holiday_settings (
    id SERIAL PRIMARY KEY,
    enabled BOOLEAN DEFAULT FALSE,
    active_holiday VARCHAR(20),
    show_banner BOOLEAN DEFAULT FALSE,
    calendar_enabled BOOLEAN DEFAULT FALSE,
    calendar_days_feb23 INTEGER DEFAULT 8,
    calendar_days_march8 INTEGER DEFAULT 8,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставляем начальную запись
INSERT INTO t_p77282076_fruit_shop_creation.holiday_settings (id, enabled, active_holiday, show_banner, calendar_enabled)
VALUES (1, FALSE, NULL, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Таблица для отслеживания открытых подарков пользователями
CREATE TABLE IF NOT EXISTS t_p77282076_fruit_shop_creation.user_calendar_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    holiday VARCHAR(20) NOT NULL,
    day_number INTEGER NOT NULL,
    prize_id VARCHAR(100),
    prize_name VARCHAR(255),
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, holiday, day_number)
);

CREATE INDEX IF NOT EXISTS idx_user_calendar_user_holiday ON t_p77282076_fruit_shop_creation.user_calendar_progress(user_id, holiday);
CREATE INDEX IF NOT EXISTS idx_user_calendar_opened_at ON t_p77282076_fruit_shop_creation.user_calendar_progress(opened_at);

COMMENT ON TABLE t_p77282076_fruit_shop_creation.holiday_settings IS 'Глобальные настройки праздничных акций, синхронизируются для всех пользователей';
COMMENT ON TABLE t_p77282076_fruit_shop_creation.user_calendar_progress IS 'Прогресс пользователей по открытию подарков в праздничном календаре';