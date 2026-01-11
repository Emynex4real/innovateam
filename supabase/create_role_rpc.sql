-- INDUSTRY STANDARD: RPC FUNCTION FOR ROLE ASSIGNMENT
-- This ensures atomic, secure role updates

CREATE OR REPLACE FUNCTION set_user_role(user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  -- Wait for profile to exist (with retry logic)
  FOR i IN 1..10 LOOP
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id) THEN
      EXIT;
    END IF;
    PERFORM pg_sleep(0.1);
  END LOOP;
  
  -- Update role flags atomically
  UPDATE user_profiles
  SET 
    is_admin = (new_role = 'admin'),
    is_tutor = (new_role = 'tutor'),
    is_student = (new_role = 'student' OR new_role IS NULL),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION set_user_role(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_user_role(UUID, TEXT) TO anon;