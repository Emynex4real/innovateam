-- PRODUCTION-GRADE BROADCAST NOTIFICATION SYSTEM
-- Senior Engineer Approach

-- 1. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement')),
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "users_update_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "system_insert_notifications" ON public.notifications;

-- Create policies
CREATE POLICY "users_view_own_notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "system_insert_notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 2. Create broadcast notification function
CREATE OR REPLACE FUNCTION public.admin_broadcast_notification(
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'announcement',
  notification_priority TEXT DEFAULT 'normal',
  target_roles TEXT[] DEFAULT NULL  -- NULL = all users, or specify ['student', 'tutor']
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  admin_user_id UUID;
  total_recipients INTEGER := 0;
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
  
  -- Validate inputs
  IF notification_title IS NULL OR TRIM(notification_title) = '' THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  
  IF notification_message IS NULL OR TRIM(notification_message) = '' THEN
    RAISE EXCEPTION 'Message is required';
  END IF;
  
  IF notification_type NOT IN ('info', 'success', 'warning', 'error', 'announcement') THEN
    RAISE EXCEPTION 'Invalid type. Must be: info, success, warning, error, or announcement';
  END IF;
  
  IF notification_priority NOT IN ('low', 'normal', 'high', 'urgent') THEN
    RAISE EXCEPTION 'Invalid priority. Must be: low, normal, high, or urgent';
  END IF;
  
  -- Insert notifications for all users (or filtered by role)
  IF target_roles IS NULL THEN
    -- Broadcast to ALL users
    INSERT INTO notifications (user_id, title, message, type, priority, metadata)
    SELECT 
      id,
      notification_title,
      notification_message,
      notification_type,
      notification_priority,
      jsonb_build_object(
        'broadcast', true,
        'sent_by_admin', admin_user_id,
        'sent_at', NOW()
      )
    FROM user_profiles
    WHERE status = 'active';
    
    GET DIAGNOSTICS total_recipients = ROW_COUNT;
  ELSE
    -- Broadcast to specific roles
    INSERT INTO notifications (user_id, title, message, type, priority, metadata)
    SELECT 
      id,
      notification_title,
      notification_message,
      notification_type,
      notification_priority,
      jsonb_build_object(
        'broadcast', true,
        'sent_by_admin', admin_user_id,
        'sent_at', NOW(),
        'target_roles', target_roles
      )
    FROM user_profiles
    WHERE status = 'active' AND role = ANY(target_roles);
    
    GET DIAGNOSTICS total_recipients = ROW_COUNT;
  END IF;
  
  -- Log the broadcast action
  INSERT INTO admin_actions (
    admin_id,
    action_type,
    details
  ) VALUES (
    admin_user_id,
    'broadcast_notification',
    jsonb_build_object(
      'title', notification_title,
      'type', notification_type,
      'priority', notification_priority,
      'recipients', total_recipients,
      'target_roles', target_roles,
      'timestamp', NOW()
    )
  );
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'recipients', total_recipients,
    'message', format('Notification sent to %s users', total_recipients)
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

GRANT EXECUTE ON FUNCTION public.admin_broadcast_notification TO authenticated;

-- Verify
SELECT routine_name FROM information_schema.routines WHERE routine_name = 'admin_broadcast_notification';
