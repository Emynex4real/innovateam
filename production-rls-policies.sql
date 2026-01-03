-- PRODUCTION-GRADE RLS POLICIES
-- Best practices for user_profiles table security

-- 1. Drop all existing policies
DROP POLICY IF EXISTS "admins_view_all_users" ON public.user_profiles;
DROP POLICY IF EXISTS "service_role_all_access" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_all" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;

-- 2. SERVICE ROLE: Full access (for backend operations)
CREATE POLICY "service_role_full_access" 
ON public.user_profiles
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 3. INSERT: Only during registration (handled by trigger)
CREATE POLICY "allow_insert_during_registration" 
ON public.user_profiles
FOR INSERT 
TO authenticated, anon
WITH CHECK (auth.uid() = id);

-- 4. SELECT: Role-based access
CREATE POLICY "users_can_view_profiles" 
ON public.user_profiles
FOR SELECT 
TO authenticated
USING (
  -- Users can view their own profile
  auth.uid() = id
  OR
  -- Admins can view all profiles (using user_metadata to avoid recursion)
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  OR
  -- Public fields visible to all authenticated users
  true  -- Change to false if you want strict privacy
);

-- 5. UPDATE: Users can only update their own profile
CREATE POLICY "users_can_update_own_profile" 
ON public.user_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. DELETE: Only admins can delete (optional)
CREATE POLICY "admins_can_delete_users" 
ON public.user_profiles
FOR DELETE 
TO authenticated
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN length(qual::text) > 50 THEN substring(qual::text, 1, 50) || '...'
    ELSE qual::text
  END as policy_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;
