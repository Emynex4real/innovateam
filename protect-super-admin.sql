-- Protect Super Admin (Creator) from role changes
-- Run this in Supabase SQL Editor

-- Drop and recreate the function with super admin protection
DROP FUNCTION IF EXISTS public.admin_update_user_role;

CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id UUID,
  new_role TEXT,
  reason TEXT DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  admin_user_id UUID;
  old_role TEXT;
  target_email TEXT;
  super_admin_email TEXT := 'emynex4real@gmail.com'; -- SUPER ADMIN (CREATOR)
  result JSON;
BEGIN
  admin_user_id := auth.uid();
  
  -- Verify admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = admin_user_id 
    AND (role = 'admin' OR is_admin = true)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required';
  END IF;
  
  -- Validate new role
  IF new_role NOT IN ('student', 'tutor', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be: student, tutor, or admin';
  END IF;
  
  -- Get target user info with row lock
  SELECT role, email INTO old_role, target_email
  FROM user_profiles
  WHERE id = target_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- PROTECT SUPER ADMIN (CREATOR) - Cannot be demoted
  IF target_email = super_admin_email AND new_role != 'admin' THEN
    RAISE EXCEPTION 'Cannot change role of super admin (creator account)';
  END IF;
  
  -- Prevent self-demotion (admin can't remove their own admin role)
  IF target_user_id = admin_user_id AND new_role != 'admin' THEN
    RAISE EXCEPTION 'Cannot remove your own admin privileges';
  END IF;
  
  -- Check if role is already set
  IF old_role = new_role THEN
    RAISE EXCEPTION 'User already has role: %', new_role;
  END IF;
  
  -- Update role and related flags
  UPDATE user_profiles
  SET 
    role = new_role,
    is_admin = (new_role = 'admin'),
    is_tutor = (new_role = 'tutor'),
    is_student = (new_role = 'student'),
    updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Log the action in admin_actions table
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    target_user_id,
    details
  ) VALUES (
    admin_user_id,
    'role_change',
    target_user_id,
    jsonb_build_object(
      'old_role', old_role,
      'new_role', new_role,
      'reason', COALESCE(reason, 'No reason provided'),
      'target_email', target_email,
      'timestamp', NOW()
    )
  );
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'old_role', old_role,
    'new_role', new_role,
    'user_email', target_email,
    'message', format('Role updated from %s to %s', old_role, new_role)
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_role TO authenticated;

-- Verify
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'admin_update_user_role';
