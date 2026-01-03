-- PRODUCTION-GRADE ROLE MANAGEMENT
-- Senior Engineer Approach with Security & Audit Trail

-- 1. Create secure stored procedure for role changes
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
  
  -- Prevent self-demotion (admin can't remove their own admin role)
  IF target_user_id = admin_user_id AND new_role != 'admin' THEN
    RAISE EXCEPTION 'Cannot remove your own admin privileges';
  END IF;
  
  -- Get current role with row lock
  SELECT role, email INTO old_role, target_email
  FROM user_profiles
  WHERE id = target_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.admin_update_user_role TO authenticated;

-- 2. Create admin_actions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.user_profiles(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists
DROP POLICY IF EXISTS "admins_view_audit_log" ON public.admin_actions;

-- Create policy for admins to view audit log
CREATE POLICY "admins_view_audit_log" ON public.admin_actions
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Create policy for system to insert audit logs
DROP POLICY IF EXISTS "system_insert_audit_log" ON public.admin_actions;
CREATE POLICY "system_insert_audit_log" ON public.admin_actions
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON public.admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);

-- Verify function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'admin_update_user_role';
