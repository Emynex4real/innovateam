-- Add wallet_balance column to users table
-- Run this SQL script on your database

-- For MySQL/MariaDB
ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00;

-- For PostgreSQL (uncomment if using PostgreSQL)
-- ALTER TABLE users ADD COLUMN wallet_balance NUMERIC(10,2) DEFAULT 0.00;

-- For SQLite (uncomment if using SQLite)
-- ALTER TABLE users ADD COLUMN wallet_balance REAL DEFAULT 0.0;

-- Update existing users to have 0 balance
UPDATE users SET wallet_balance = 0.00 WHERE wallet_balance IS NULL;

-- Add index for better performance on wallet queries
CREATE INDEX idx_users_wallet_balance ON users(wallet_balance);

-- Verify the column was added
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'wallet_balance';