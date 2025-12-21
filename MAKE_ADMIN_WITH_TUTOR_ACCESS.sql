-- Make emynex4real@gmail.com an admin (with tutor access)
-- Admins can access both /admin and /tutor routes

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'emynex4real@gmail.com';

UPDATE public.user_profiles
SET role = 'admin'
WHERE email = 'emynex4real@gmail.com';

-- Verify
SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    up.role as profile_role,
    '✅ Admin can access /admin AND /tutor' as note
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.id = au.id
WHERE au.email = 'emynex4real@gmail.com';
