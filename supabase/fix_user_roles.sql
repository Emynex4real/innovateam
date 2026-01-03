-- ============================================
-- FIX USER ROLES - Run this to diagnose and fix
-- ============================================

-- 1. Check if tutor role exists in enum
SELECT unnest(enum_range(NULL::user_role)) AS role;

-- 2. Add tutor role if missing
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tutor';

-- 3. Check all users and their roles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- 4. Fix specific user - REPLACE EMAIL WITH YOUR ACTUAL EMAIL
-- Uncomment and modify the line below:

-- Make user a STUDENT:
-- UPDATE public.user_profiles SET role = 'student' WHERE email = 'student@example.com';

-- Make user a TUTOR:
-- UPDATE public.user_profiles SET role = 'tutor' WHERE email = 'tutor@example.com';

-- 5. Verify the change
SELECT email, role FROM public.user_profiles WHERE email = 'YOUR_EMAIL_HERE';

-- ============================================
-- INSTRUCTIONS:
-- 1. Copy your email from the SELECT query in step 3
-- 2. Uncomment the appropriate UPDATE query in step 4
-- 3. Replace the email with your actual email
-- 4. Run the UPDATE query
-- 5. Logout and login again
-- ============================================
