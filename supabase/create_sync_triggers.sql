-- CREATE SYNC TRIGGER TO KEEP BOTH TABLES IN SYNC
-- This ensures role changes in either table update the other

-- Function to sync users -> user_profiles
CREATE OR REPLACE FUNCTION sync_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_profiles when users table changes
  UPDATE user_profiles 
  SET 
    is_admin = (NEW.role = 'admin'),
    is_tutor = (NEW.role = 'tutor'),
    is_student = (NEW.role = 'student'),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync user_profiles -> users  
CREATE OR REPLACE FUNCTION sync_profile_roles()
RETURNS TRIGGER AS $$
DECLARE
  new_role text;
BEGIN
  -- Determine role from boolean flags
  IF NEW.is_admin THEN
    new_role := 'admin';
  ELSIF NEW.is_tutor THEN  
    new_role := 'tutor';
  ELSIF NEW.is_student THEN
    new_role := 'student';
  ELSE
    new_role := 'student'; -- default
  END IF;
  
  -- Update users table
  UPDATE users 
  SET role = new_role::user_role, updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_sync_user_roles ON users;
CREATE TRIGGER trigger_sync_user_roles
  AFTER UPDATE OF role ON users
  FOR EACH ROW EXECUTE FUNCTION sync_user_roles();

DROP TRIGGER IF EXISTS trigger_sync_profile_roles ON user_profiles;  
CREATE TRIGGER trigger_sync_profile_roles
  AFTER UPDATE OF is_admin, is_tutor, is_student ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION sync_profile_roles();