-- Fix admin access for emynex4real@gmail.com
-- Run this in Supabase SQL Editor

-- Step 1: Update auth metadata to admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'emynex4real@gmail.com';

-- Step 2: Update user_profiles table to admin
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'emynex4real@gmail.com');

-- Step 3: Verify the fix
SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    up.role as profile_role,
    CASE 
        WHEN au.raw_user_meta_data->>'role' = 'admin' AND up.role = 'admin' 
        THEN '✅ ADMIN ACCESS RESTORED'
        ELSE '❌ STILL HAS ISSUES'
    END as status
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.id = au.id
WHERE au.email = 'emynex4real@gmail.com';
