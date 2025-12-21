-- Direct SQL fix for emynex4real@gmail.com admin access
-- Run this in Supabase SQL Editor

-- Step 1: Add tutor role if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'tutor' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'tutor';
    END IF;
END $$;

-- Step 2: Find the user
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    u.role as table_role
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE au.email = 'emynex4real@gmail.com';

-- Step 3: Update auth metadata to admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'emynex4real@gmail.com';

-- Step 4: Temporarily disable the trigger
ALTER TABLE public.users DISABLE TRIGGER update_users_updated_at;

-- Step 5: Update users table to admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'emynex4real@gmail.com';

-- Step 6: Re-enable the trigger
ALTER TABLE public.users ENABLE TRIGGER update_users_updated_at;

-- Step 7: Verify the fix
SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_metadata_role,
    u.role as users_table_role,
    CASE 
        WHEN au.raw_user_meta_data->>'role' = 'admin' AND u.role::text = 'admin' 
        THEN '✅ ADMIN ACCESS RESTORED'
        ELSE '❌ STILL HAS ISSUES'
    END as status
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE au.email = 'emynex4real@gmail.com';
