-- ADD ADMIN BYPASS POLICY TO VIEW ALL USERS
-- Run this in Supabase SQL Editor

-- STEP 1: Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND (is_admin = true OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Add admin policy to SELECT all profiles
CREATE POLICY "Admins can view all profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (
  -- Either viewing own profile OR user is admin
  id = auth.uid() OR is_admin()
);

-- STEP 3: Drop the old restrictive policy
DROP POLICY IF EXISTS "Allow users to view own profile" ON user_profiles;

-- STEP 4: Add admin policy to UPDATE all profiles
CREATE POLICY "Admins can update all profiles"
ON user_profiles FOR UPDATE
TO authenticated
USING (
  -- Either updating own profile OR user is admin
  id = auth.uid() OR is_admin()
)
WITH CHECK (
  id = auth.uid() OR is_admin()
);

-- STEP 5: Drop the old restrictive update policy
DROP POLICY IF EXISTS "Allow users to update own profile" ON user_profiles;

-- STEP 6: Verify policies
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- STEP 7: Test - should return ALL users now
SELECT id, email, role, is_admin, wallet_balance 
FROM user_profiles 
LIMIT 10;
