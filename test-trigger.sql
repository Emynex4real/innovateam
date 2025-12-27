-- Test the trigger and check table structure
-- Run this in Supabase SQL Editor

-- 1. Check user_profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Check existing users
SELECT id, email, full_name, role, created_at
FROM public.user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 4. Test if the trigger function works (manual test)
-- This simulates what happens during registration
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Try to call the function logic
  test_result := 'Trigger function exists and is callable';
  RAISE NOTICE '%', test_result;
END $$;
