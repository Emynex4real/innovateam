-- Fix admin access to view all users
-- Run this in Supabase SQL Editor

-- 1. Check current admin users
SELECT id, email, full_name, role, is_admin
FROM public.user_profiles
WHERE role = 'admin' OR is_admin = true;

-- 2. Add policy for admins to view all users
DROP POLICY IF EXISTS "admins_view_all_users" ON public.user_profiles;

CREATE POLICY "admins_view_all_users" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() 
      AND (role = 'admin' OR is_admin = true)
    )
  );

-- 3. Verify all policies
SELECT policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;
