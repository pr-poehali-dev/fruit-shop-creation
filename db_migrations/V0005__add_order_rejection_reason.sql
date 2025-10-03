-- Add rejection_reason column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;