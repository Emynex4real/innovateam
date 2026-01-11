-- EMERGENCY FIX: Temporarily disable RLS to test
-- Run this in Supabase SQL Editor

-- STEP 1: Disable RLS completely (TEMPORARY - for testing only)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Test if queries work now
SELECT id, email, role, is_admin, wallet_balance 
FROM user_profiles 
LIMIT 5;

-- STEP 3: Check your user specifically
SELECT id, email, role, is_admin, is_tutor, is_student, wallet_balance 
FROM user_profiles 
WHERE email = 'emynex4real@gmail.com';

-- STEP 4: If this works, the issue is definitely in RLS policies
-- Re-enable RLS after confirming
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
