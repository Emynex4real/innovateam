-- Quick fix for user_profiles table
-- Run this in your Supabase SQL Editor

-- 1. Add email column if missing
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Update existing users with email from auth.users
UPDATE user_profiles 
SET email = auth_users.email 
FROM auth.users AS auth_users 
WHERE user_profiles.id = auth_users.id 
AND user_profiles.email IS NULL;

-- 3. Ensure wallet_balance exists and has default
ALTER TABLE user_profiles ALTER COLUMN wallet_balance SET DEFAULT 0;
UPDATE user_profiles SET wallet_balance = 0 WHERE wallet_balance IS NULL;

-- 4. Check if emynex4real@gmail.com user exists and has proper data
SELECT id, email, full_name, wallet_balance, created_at 
FROM user_profiles 
WHERE email = 'emynex4real@gmail.com';

-- 5. If user doesn't exist, create it (replace USER_ID with actual ID from auth.users)
-- First, find the user ID:
SELECT id, email FROM auth.users WHERE email = 'emynex4real@gmail.com';

-- Then insert if missing (uncomment and replace USER_ID):
-- INSERT INTO user_profiles (id, email, full_name, wallet_balance, role, status)
-- VALUES ('USER_ID_HERE', 'emynex4real@gmail.com', 'User Name', 0, 'user', 'active')
-- ON CONFLICT (id) DO NOTHING;