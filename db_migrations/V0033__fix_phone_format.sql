-- Исправление формата телефонов: добавление пробелов
-- Старый формат: +7(999)123-45-67
-- Новый формат: +7 (999) 123-45-67

UPDATE users 
SET phone = REPLACE(REPLACE(phone, '+7(', '+7 ('), ')', ') ')
WHERE phone LIKE '+7(%'
  AND phone NOT LIKE '+7 (%';
