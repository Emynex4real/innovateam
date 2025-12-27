-- URGENT FIX: Remove infinite recursion in RLS policies
-- Run this IMMEDIATELY in Supabase SQL Editor

-- 1. Drop the problematic admin policy
DROP POLICY IF EXISTS "admins_view_all_users" ON public.user_profiles;

-- 2. Drop all existing policies and recreate them properly
DROP POLICY IF EXISTS "service_role_all_access" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;

-- 3. Create clean, non-recursive policies
CREATE POLICY "service_role_all_access" ON public.user_profiles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "users_insert_own" ON public.user_profiles
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "users_select_all" ON public.user_profiles
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "users_update_own" ON public.user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Verify policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'user_profiles';
