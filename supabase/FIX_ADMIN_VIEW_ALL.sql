-- Fix admin policy to allow admins to view ALL user profiles
-- The current policy is blocking because it's checking the wrong condition

-- Drop the broken admin policy
DROP POLICY IF EXISTS "admin_view_all" ON public.user_profiles;

-- Create correct admin policy
-- This allows users with is_admin=true to view ALL profiles
CREATE POLICY "admin_view_all" 
  ON public.user_profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 
      FROM public.user_profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Verify policies
SELECT 
  policyname, 
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'user_profiles' 
ORDER BY policyname;
