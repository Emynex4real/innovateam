-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow users to create own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "service_role_full_access" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_insert_during_registration" ON public.user_profiles;
DROP POLICY IF EXISTS "admins_can_delete_users" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow service role to insert profiles" ON public.user_profiles;

-- Create ONLY 3 essential policies
CREATE POLICY "select_own" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "update_own" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "insert_any" ON public.user_profiles FOR INSERT WITH CHECK (true);

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';
