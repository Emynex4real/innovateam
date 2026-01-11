-- Test script to verify tutor role fix
-- Run this in Supabase SQL Editor after applying the fix

-- 1. Check if tutor role exists in enum
SELECT 'Available roles:' as test, unnest(enum_range(NULL::user_role)) AS role;

-- 2. Check current users and their roles
SELECT 
    'Current users:' as test,
    email,
    full_name,
    role,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- 3. Test role assignment (replace with actual email)
-- UPDATE public.users SET role = 'tutor' WHERE email = 'test-tutor@example.com';
-- UPDATE public.users SET role = 'student' WHERE email = 'test-student@example.com';

-- 4. Verify role update worked
-- SELECT email, role FROM public.users WHERE email IN ('test-tutor@example.com', 'test-student@example.com');

-- Expected results:
-- 1. Should show: student, admin, tutor
-- 2. Should show existing users with their roles
-- 3. Role updates should work without errors
-- 4. Users should have correct roles assigned