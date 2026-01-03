-- ============================================
-- FIX USER ROLE - IMMEDIATE ACTION
-- ============================================

-- STEP 1: Check all users and their roles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- STEP 2: Find YOUR email in the list above, then run ONE of these:

-- Option A: Make yourself a TUTOR
-- UPDATE public.user_profiles SET role = 'tutor' WHERE email = 'YOUR_EMAIL_HERE';

-- Option B: Make yourself a STUDENT
-- UPDATE public.user_profiles SET role = 'student' WHERE email = 'YOUR_EMAIL_HERE';

-- STEP 3: Verify the change
-- SELECT email, role FROM public.user_profiles WHERE email = 'YOUR_EMAIL_HERE';

-- ============================================
-- EXAMPLE (Replace with your actual email):
-- ============================================

-- UPDATE public.user_profiles SET role = 'tutor' WHERE email = 'john@example.com';

-- ============================================
-- AFTER RUNNING THIS:
-- ============================================
-- 1. Logout from the app
-- 2. Press Ctrl+Shift+Delete and clear cache
-- 3. Login again
-- 4. Try accessing /tutor again
-- ============================================
