-- Check user_profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.user_profiles'::regclass;

-- Check if role column exists and its type
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'user_profiles' AND column_name = 'role';
