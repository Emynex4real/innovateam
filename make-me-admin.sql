-- Check and set admin status
-- Run this in Supabase SQL Editor

-- 1. See all users and their admin status
SELECT 
  email, 
  full_name, 
  role, 
  is_admin,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- 2. Make a specific user an admin (REPLACE WITH YOUR EMAIL)
-- Uncomment and replace 'your-email@example.com' with your actual email
-- UPDATE public.user_profiles 
-- SET role = 'admin', is_admin = true 
-- WHERE email = 'your-email@example.com';

-- 3. Verify the change
-- SELECT email, role, is_admin 
-- FROM public.user_profiles 
-- WHERE email = 'your-email@example.com';
