-- Check all users in auth.users table
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
ORDER BY created_at DESC;

-- Check all users in public.users table  
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.users 
ORDER BY created_at DESC;

-- Count users in both tables
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM public.users) as public_users_count;