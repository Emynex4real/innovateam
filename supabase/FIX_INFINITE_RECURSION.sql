-- FIX INFINITE RECURSION IN user_profiles RLS POLICIES
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig/sql/new

-- STEP 1: Disable RLS temporarily to clear all policies
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies (including ones with different names)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_profiles';
    END LOOP;
END $$;

-- STEP 3: Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create SIMPLE policies WITHOUT recursion
-- These policies ONLY use auth.uid() - NO queries to user_profiles

-- Allow users to read their own profile
CREATE POLICY "user_profiles_select_own" ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "user_profiles_update_own" ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (for registration)
CREATE POLICY "user_profiles_insert_own" ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- STEP 5: Verify policies are correct
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- STEP 6: Test query (should work now)
SELECT id, email, role, is_admin, wallet_balance 
FROM user_profiles 
WHERE id = auth.uid();
