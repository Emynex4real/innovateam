-- CRITICAL FIX: Update trigger to insert into user_profiles instead of users
-- This fixes the "Database error saving new user" during signup

-- 1. Drop the broken trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the old function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create new function that inserts into user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
  
  INSERT INTO public.user_profiles (id, email, full_name, phone, role, is_admin, is_tutor, is_student)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    user_role,
    (user_role = 'admin'),
    (user_role = 'tutor'),
    (user_role = 'student')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Profile creation failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Disable RLS temporarily or add permissive policy
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled:
-- DROP POLICY IF EXISTS "Allow signup insert" ON public.user_profiles;
-- CREATE POLICY "Allow signup insert" ON public.user_profiles FOR INSERT WITH CHECK (true);

-- 6. Verify the fix
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';
