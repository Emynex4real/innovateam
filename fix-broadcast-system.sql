-- Fix existing notifications table for broadcast system
-- Run this in Supabase SQL Editor

-- Add missing columns to existing notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "users_update_own_notifications" ON public.notifications;
DROP POLICY IF EXISTS "system_insert_notifications" ON public.notifications;

-- Create clean policies
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

-- Create broadcast function
CREATE OR REPLACE FUNCTION public.admin_broadcast_notification(
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'announcement',
  notification_priority TEXT DEFAULT 'normal',
  target_roles TEXT[] DEFAULT NULL
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
  
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = admin_user_id 
    AND (role = 'admin' OR is_admin = true)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required';
  END IF;
  
  IF notification_title IS NULL OR TRIM(notification_title) = '' THEN
    RAISE EXCEPTION 'Title is required';
  END IF;
  
  IF notification_message IS NULL OR TRIM(notification_message) = '' THEN
    RAISE EXCEPTION 'Message is required';
  END IF;
  
  IF target_roles IS NULL THEN
    INSERT INTO notifications (user_id, title, message, type, priority, is_read, metadata)
    SELECT 
      id,
      notification_title,
      notification_message,
      notification_type,
      notification_priority,
      FALSE,
      jsonb_build_object(
        'broadcast', true,
        'sent_by_admin', admin_user_id,
        'sent_at', NOW()
      )
    FROM user_profiles
    WHERE status = 'active';
    
    GET DIAGNOSTICS total_recipients = ROW_COUNT;
  ELSE
    INSERT INTO notifications (user_id, title, message, type, priority, is_read, metadata)
    SELECT 
      id,
      notification_title,
      notification_message,
      notification_type,
      notification_priority,
      FALSE,
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
  
  INSERT INTO admin_actions (admin_id, action_type, details)
  VALUES (
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

SELECT routine_name FROM information_schema.routines WHERE routine_name = 'admin_broadcast_notification';
