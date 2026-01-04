-- Ensure user_profiles table has role flag columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_tutor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT FALSE;

-- Update existing records to set flags based on role
UPDATE user_profiles
SET 
  is_admin = (role = 'admin'),
  is_tutor = (role = 'tutor'),
  is_student = (role = 'student')
WHERE role IS NOT NULL;

-- Create or replace function to sync role flags
CREATE OR REPLACE FUNCTION sync_role_flags()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set role flags based on role column
  NEW.is_admin := (NEW.role = 'admin');
  NEW.is_tutor := (NEW.role = 'tutor');
  NEW.is_student := (NEW.role = 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS sync_role_flags_trigger ON user_profiles;

CREATE TRIGGER sync_role_flags_trigger
BEFORE INSERT OR UPDATE OF role ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION sync_role_flags();

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_tutor ON user_profiles(is_tutor) WHERE is_tutor = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin) WHERE is_admin = TRUE;
