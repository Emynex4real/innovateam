-- Clean up conflicting RLS policies
-- Run this in Supabase SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow service role full access" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow service role full access to profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow public read profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow public update profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_profiles;

-- Create simple, working policies
CREATE POLICY "service_role_all_access" ON public.user_profiles
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_insert_own" ON public.user_profiles
  FOR INSERT 
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "users_select_own" ON public.user_profiles
  FOR SELECT 
  TO authenticated, anon
  USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "users_update_own" ON public.user_profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify new policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'user_profiles';
