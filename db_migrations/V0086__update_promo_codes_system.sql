-- Обновляем таблицу промокодов для новой системы
ALTER TABLE t_p77282076_fruit_shop_creation.referral_codes 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS uses_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT NULL;

-- Добавляем индекс для быстрого поиска промокодов
CREATE INDEX IF NOT EXISTS idx_referral_code ON t_p77282076_fruit_shop_creation.referral_codes(referral_code);

-- Обновляем таблицу рефералов
ALTER TABLE t_p77282076_fruit_shop_creation.referrals
ADD COLUMN IF NOT EXISTS used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

COMMENT ON TABLE t_p77282076_fruit_shop_creation.referral_codes IS 'Промокоды пользователей для приглашения друзей';
COMMENT ON TABLE t_p77282076_fruit_shop_creation.referrals IS 'Список приглашенных друзей по промокодам';