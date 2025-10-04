-- Добавляем поле для URL логотипа
ALTER TABLE site_settings 
ADD COLUMN logo_url TEXT DEFAULT '';