-- Check all users in the database
-- Run this in Supabase SQL Editor

-- 1. Check auth.users (Supabase Auth)
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check user_profiles (Your app's user table)
SELECT 
  id,
  email,
  full_name,
  role,
  wallet_balance,
  status,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- 3. Check if there's a mismatch
SELECT 
  'auth.users' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as count
FROM public.user_profiles;
