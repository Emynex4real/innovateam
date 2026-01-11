-- Re-enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow service role to insert during signup (trigger uses SECURITY DEFINER)
CREATE POLICY "Service role insert profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';
