-- CRITICAL FIX: Run this in Supabase SQL Editor
-- This fixes the database trigger that's causing registration to fail

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into user_profiles, ignore if already exists
  INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name, 
    role, 
    is_student,
    is_tutor,
    is_admin,
    wallet_balance,
    status
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN TRUE ELSE FALSE END,
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'tutor' THEN TRUE ELSE FALSE END,
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'admin' THEN TRUE ELSE FALSE END,
    0.00,
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Step 4: Disable email confirmation (TEMPORARY - for testing)
-- Go to Supabase Dashboard > Authentication > Settings > Email Auth
-- Set "Enable email confirmations" to OFF

-- Step 5: Verify the setup
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_profile';
