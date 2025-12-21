-- Add 'tutor' role to the user_role enum
-- This migration adds support for the tutor role in the database

-- First, check if 'tutor' already exists in the enum
DO $$ 
BEGIN
    -- Add 'tutor' to user_role enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'tutor' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'tutor';
        RAISE NOTICE 'Added tutor role to user_role enum';
    ELSE
        RAISE NOTICE 'Tutor role already exists in user_role enum';
    END IF;
END $$;

-- Update any existing users with 'tutor' role in metadata but not in the table
-- This ensures consistency between auth.users metadata and public.users table
UPDATE public.users u
SET role = 'tutor'
FROM auth.users au
WHERE u.id = au.id
AND au.raw_user_meta_data->>'role' = 'tutor'
AND u.role != 'tutor';

-- Verify the changes
SELECT 
    'user_role enum values:' as info,
    enumlabel as role
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;
