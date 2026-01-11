-- FINAL FIX: Re-enable RLS with working policies
-- Run this in Supabase SQL Editor

-- STEP 1: Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 2: Drop old policies
DROP POLICY IF EXISTS "user_profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_own" ON user_profiles;

-- STEP 3: Create new policies that work
-- Allow authenticated users to read their own profile
CREATE POLICY "Allow users to view own profile"
ON user_profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Allow authenticated users to update their own profile
CREATE POLICY "Allow users to update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow authenticated users to insert their own profile
CREATE POLICY "Allow users to insert own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- STEP 4: Test query with RLS enabled
SELECT id, email, role, is_admin, wallet_balance 
FROM user_profiles 
WHERE id = auth.uid();

-- STEP 5: Verify policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';
