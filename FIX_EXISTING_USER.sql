-- Run this in Supabase SQL Editor to fix michaelbalogun34@gmail.com

-- Step 1: Check if user exists in auth.users
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'michaelbalogun34@gmail.com';

-- Step 2: If user exists, confirm their email
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'michaelbalogun34@gmail.com';

-- Step 3: Create or update user_profiles entry
INSERT INTO user_profiles (id, email, full_name, wallet_balance, role, status)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', 'User'), 
  0, 
  'user', 
  'active'
FROM auth.users 
WHERE email = 'michaelbalogun34@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    wallet_balance = COALESCE(user_profiles.wallet_balance, 0);

-- Step 4: Verify everything is correct
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.wallet_balance,
  p.role,
  p.status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'michaelbalogun34@gmail.com';
