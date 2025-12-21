-- Add is_highlighted column to accounts table
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_highlighted BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_accounts_is_highlighted ON accounts(is_highlighted);

