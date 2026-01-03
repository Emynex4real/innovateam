-- Admin User Setup and Management
-- Run this AFTER all other SQL files

-- Function to safely create admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
  admin_email TEXT,
  admin_name TEXT DEFAULT 'System Administrator'
)
RETURNS TEXT AS $$
DECLARE
  admin_id UUID;
  result_message TEXT;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_id 
  FROM public.users 
  WHERE email = admin_email AND role = 'admin';
  
  IF admin_id IS NOT NULL THEN
    RETURN 'Admin user already exists with email: ' || admin_email;
  END IF;
  
  -- Check if user exists but is not admin
  SELECT id INTO admin_id 
  FROM public.users 
  WHERE email = admin_email;
  
  IF admin_id IS NOT NULL THEN
    -- Upgrade existing user to admin
    UPDATE public.users 
    SET role = 'admin', 
        full_name = COALESCE(full_name, admin_name),
        updated_at = NOW()
    WHERE id = admin_id;
    
    -- Log the admin creation
    INSERT INTO public.activity_logs (user_id, action, resource, metadata)
    VALUES (admin_id, 'admin_role_granted', 'user_management', 
            jsonb_build_object('email', admin_email, 'granted_by', 'system'));
    
    RETURN 'User upgraded to admin: ' || admin_email;
  ELSE
    RETURN 'User not found. Please register first with email: ' || admin_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke admin privileges
CREATE OR REPLACE FUNCTION public.revoke_admin_privileges(
  target_email TEXT,
  requesting_admin_id UUID
)
RETURNS TEXT AS $$
DECLARE
  target_id UUID;
  admin_count INTEGER;
BEGIN
  -- Verify requesting user is admin
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = requesting_admin_id AND role = 'admin') THEN
    RETURN 'Access denied: Only admins can revoke admin privileges';
  END IF;
  
  -- Find target user
  SELECT id INTO target_id 
  FROM public.users 
  WHERE email = target_email AND role = 'admin';
  
  IF target_id IS NULL THEN
    RETURN 'Admin user not found with email: ' || target_email;
  END IF;
  
  -- Prevent self-demotion
  IF target_id = requesting_admin_id THEN
    RETURN 'Cannot revoke your own admin privileges';
  END IF;
  
  -- Check if this is the last admin
  SELECT COUNT(*) INTO admin_count 
  FROM public.users 
  WHERE role = 'admin';
  
  IF admin_count <= 1 THEN
    RETURN 'Cannot revoke: At least one admin must remain';
  END IF;
  
  -- Revoke admin privileges
  UPDATE public.users 
  SET role = 'student', updated_at = NOW()
  WHERE id = target_id;
  
  -- Log the action
  INSERT INTO public.activity_logs (user_id, action, resource, metadata)
  VALUES (requesting_admin_id, 'admin_role_revoked', 'user_management', 
          jsonb_build_object('target_email', target_email, 'target_id', target_id));
  
  RETURN 'Admin privileges revoked for: ' || target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE(
  total_users BIGINT,
  total_admins BIGINT,
  total_transactions BIGINT,
  total_revenue NUMERIC,
  recent_signups BIGINT,
  suspicious_activities BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.users WHERE role = 'admin') as total_admins,
    (SELECT COUNT(*) FROM public.transactions) as total_transactions,
    (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE type = 'credit') as total_revenue,
    (SELECT COUNT(*) FROM public.users WHERE created_at > NOW() - INTERVAL '7 days') as recent_signups,
    (SELECT COUNT(*) FROM public.activity_logs WHERE action LIKE '%security%' AND created_at > NOW() - INTERVAL '24 hours') as suspicious_activities;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin activity log
CREATE OR REPLACE FUNCTION public.log_admin_action(
  admin_id UUID,
  action_type TEXT,
  target_resource TEXT,
  action_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    resource,
    metadata,
    created_at
  ) VALUES (
    admin_id,
    'admin_' || action_type,
    target_resource,
    action_metadata,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for admin functions
CREATE POLICY "Only admins can use admin functions" ON public.users
FOR ALL USING (
  auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
);

-- Grant execute permissions to authenticated users (RLS will control access)
GRANT EXECUTE ON FUNCTION public.create_admin_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_admin_privileges(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(UUID, TEXT, TEXT, JSONB) TO authenticated;