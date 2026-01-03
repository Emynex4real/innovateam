-- Change emynex4real@gmail.com to admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'emynex4real@gmail.com';

UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'emynex4real@gmail.com');

-- Verify
SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    up.role as profile_role
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.id = au.id
WHERE au.email = 'emynex4real@gmail.com';
