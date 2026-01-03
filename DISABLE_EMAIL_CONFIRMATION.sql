-- Quick fix: Allow users to login without email confirmation
-- Run this in Supabase SQL Editor

-- Option 1: Manually confirm existing user
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'michaelbalogun34@gmail.com';

-- Option 2: Create user_profiles entry if missing
INSERT INTO user_profiles (id, email, full_name, wallet_balance, role, status)
SELECT id, email, raw_user_meta_data->>'full_name', 0, 'user', 'active'
FROM auth.users 
WHERE email = 'michaelbalogun34@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

-- Verify the user
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.wallet_balance
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'michaelbalogun34@gmail.com';
