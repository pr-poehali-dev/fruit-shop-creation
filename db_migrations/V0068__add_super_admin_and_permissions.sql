-- Add super_admin and admin_permissions columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT ARRAY['products', 'categories', 'plants', 'users', 'orders', 'delivery-zones', 'loyalty', 'gallery', 'pages', 'codes', 'settings']::TEXT[];

-- Set default permissions for existing admins (all permissions)
UPDATE users 
SET admin_permissions = ARRAY['products', 'categories', 'plants', 'users', 'orders', 'delivery-zones', 'loyalty', 'gallery', 'pages', 'codes', 'settings']::TEXT[]
WHERE is_admin = true AND admin_permissions IS NULL;