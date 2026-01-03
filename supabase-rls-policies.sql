-- =====================================================
-- WALLET SYSTEM - ROW LEVEL SECURITY POLICIES
-- Apply these in Supabase SQL Editor
-- =====================================================

-- Enable RLS on tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRANSACTIONS TABLE POLICIES
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

-- Allow users to insert their own transactions
CREATE POLICY "Users can insert own transactions"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own transactions
CREATE POLICY "Users can view own transactions"
ON transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own transactions (optional)
CREATE POLICY "Users can update own transactions"
ON transactions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- USER_PROFILES TABLE POLICIES
-- =====================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

-- Check if policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('transactions', 'user_profiles')
ORDER BY tablename, policyname;
