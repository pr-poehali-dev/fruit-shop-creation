-- Добавляем право support для всех существующих администраторов
UPDATE t_p77282076_fruit_shop_creation.users 
SET admin_permissions = array_append(admin_permissions, 'support')
WHERE is_admin = true AND NOT ('support' = ANY(admin_permissions));