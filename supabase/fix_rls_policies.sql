-- FIX RLS POLICIES FOR USER REGISTRATION
-- This allows new users to be created

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;

-- 2. Create permissive INSERT policy for service role (used during signup)
CREATE POLICY "Allow service role to insert profiles"
ON user_profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. Create permissive INSERT policy for new users
CREATE POLICY "Allow users to create own profile"
ON user_profiles
FOR INSERT
TO authenticated, anon
WITH CHECK (auth.uid() = id);

-- 4. Allow users to read their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 5. Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Allow admins to see all profiles
CREATE POLICY "Admins can view all profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);