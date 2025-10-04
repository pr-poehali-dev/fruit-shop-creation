ALTER TABLE site_settings 
ADD COLUMN holiday_theme VARCHAR(50) DEFAULT 'none' CHECK (holiday_theme IN ('none', 'new_year', 'halloween', 'summer'));