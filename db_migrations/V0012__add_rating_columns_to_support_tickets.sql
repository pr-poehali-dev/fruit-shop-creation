-- Add rating columns to support_tickets table
ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS rating_comment TEXT;

-- Create index for ratings
CREATE INDEX IF NOT EXISTS idx_tickets_rating ON support_tickets(rating) WHERE rating IS NOT NULL;