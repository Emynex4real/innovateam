-- Add admin policy to view all profiles
CREATE POLICY "admin_view_all" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';
