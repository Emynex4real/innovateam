-- PROPER TRIGGER TO SET ROLE FLAGS FROM METADATA
-- This ensures roles are set correctly during registration

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from auth.users metadata
  SELECT raw_user_meta_data->>'role' INTO user_role
  FROM auth.users
  WHERE id = NEW.id;
  
  -- Set boolean flags based on role
  IF user_role = 'admin' THEN
    NEW.is_admin := TRUE;
    NEW.is_tutor := FALSE;
    NEW.is_student := FALSE;
  ELSIF user_role = 'tutor' THEN
    NEW.is_admin := FALSE;
    NEW.is_tutor := TRUE;
    NEW.is_student := FALSE;
  ELSE
    NEW.is_admin := FALSE;
    NEW.is_tutor := FALSE;
    NEW.is_student := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_user_role_flags ON user_profiles;

-- Create trigger that runs BEFORE insert
CREATE TRIGGER set_user_role_flags
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();