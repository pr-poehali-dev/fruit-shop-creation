-- Set user with phone +7 (905) 929-30-40 as super admin
UPDATE users 
SET is_super_admin = true 
WHERE phone = '+7 (905) 929-30-40';