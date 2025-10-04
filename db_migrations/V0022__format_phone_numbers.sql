-- Обновляем номера телефонов в формат +7(XXX)XXX-XX-XX
-- Сначала очищаем от всех символов кроме цифр, затем форматируем

UPDATE users 
SET phone = '+7(' || 
    CASE 
        WHEN LEFT(REGEXP_REPLACE(phone, '\D', '', 'g'), 1) = '8' 
        THEN SUBSTRING(REGEXP_REPLACE(phone, '\D', '', 'g'), 2, 3)
        WHEN LEFT(REGEXP_REPLACE(phone, '\D', '', 'g'), 1) = '7' 
        THEN SUBSTRING(REGEXP_REPLACE(phone, '\D', '', 'g'), 2, 3)
        ELSE SUBSTRING(REGEXP_REPLACE(phone, '\D', '', 'g'), 1, 3)
    END || ')' ||
    CASE 
        WHEN LEFT(REGEXP_REPLACE(phone, '\D', '', 'g'), 1) IN ('7', '8') 
        THEN SUBSTRING(REGEXP_REPLACE(phone, '\D', '', 'g'), 5, 3)
        ELSE SUBSTRING(REGEXP_REPLACE(phone, '\D', '', 'g'), 4, 3)
    END || '-' ||
    CASE 
        WHEN LEFT(REGEXP_REPLACE(phone, '\D', '', 'g'), 1) IN ('7', '8') 
        THEN SUBSTRING(REGEXP_REPLACE(phone, '\D', '', 'g'), 8, 2)
        ELSE SUBSTRING(REGEXP_REPLACE(phone, '\D', '', 'g'), 7, 2)
    END || '-' ||
    CASE 
        WHEN LEFT(REGEXP_REPLACE(phone, '\D', '', 'g'), 1) IN ('7', '8') 
        THEN SUBSTRING(REGEXP_REPLACE(phone, '\D', '', 'g'), 10, 2)
        ELSE SUBSTRING(REGEXP_REPLACE(phone, '\D', '', 'g'), 9, 2)
    END
WHERE phone IS NOT NULL;