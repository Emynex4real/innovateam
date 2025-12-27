-- Fix trigger to save phone numbers
-- Run this in Supabase SQL Editor

-- Drop and recreate the trigger function with phone support
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email, 
    full_name,
    phone,
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
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN TRUE ELSE FALSE END,
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'tutor' THEN TRUE ELSE FALSE END,
    CASE WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'admin' THEN TRUE ELSE FALSE END,
    0.00,
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_profile();

-- Verify
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created_profile';
