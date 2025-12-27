-- Fix notification content column and add role-based targeting
-- Run this in Supabase SQL Editor

-- 1. Add content column as alias/copy of message (if not exists)
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS content TEXT;

-- 2. Update existing notifications to copy message to content
UPDATE public.notifications 
SET content = message 
WHERE content IS NULL AND message IS NOT NULL;

-- 3. Drop and recreate broadcast function with content field and role targeting
DROP FUNCTION IF EXISTS public.admin_broadcast_notification(TEXT, TEXT, TEXT, TEXT, TEXT[]);

CREATE OR REPLACE FUNCTION public.admin_broadcast_notification(
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT DEFAULT 'announcement',
  notification_priority TEXT DEFAULT 'normal',
  target_audience TEXT DEFAULT 'all'
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
  
  -- Check admin authorization
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
  
  -- Send to all active users or filtered by role
  IF target_audience = 'all' THEN
    INSERT INTO notifications (user_id, title, message, content, type, priority, is_read, read, metadata)
    SELECT 
      id,
      notification_title,
      notification_message,
      notification_message,
      notification_type,
      notification_priority,
      FALSE,
      FALSE,
      jsonb_build_object(
        'broadcast', true,
        'sent_by_admin', admin_user_id,
        'sent_at', NOW(),
        'target_audience', target_audience
      )
    FROM user_profiles
    WHERE status = 'active';
    
    GET DIAGNOSTICS total_recipients = ROW_COUNT;
    
  ELSIF target_audience = 'tutors' THEN
    INSERT INTO notifications (user_id, title, message, content, type, priority, is_read, read, metadata)
    SELECT 
      id,
      notification_title,
      notification_message,
      notification_message,
      notification_type,
      notification_priority,
      FALSE,
      FALSE,
      jsonb_build_object(
        'broadcast', true,
        'sent_by_admin', admin_user_id,
        'sent_at', NOW(),
        'target_audience', target_audience
      )
    FROM user_profiles
    WHERE status = 'active' AND (role = 'tutor' OR is_tutor = true);
    
    GET DIAGNOSTICS total_recipients = ROW_COUNT;
    
  ELSIF target_audience = 'students' THEN
    INSERT INTO notifications (user_id, title, message, content, type, priority, is_read, read, metadata)
    SELECT 
      id,
      notification_title,
      notification_message,
      notification_message,
      notification_type,
      notification_priority,
      FALSE,
      FALSE,
      jsonb_build_object(
        'broadcast', true,
        'sent_by_admin', admin_user_id,
        'sent_at', NOW(),
        'target_audience', target_audience
      )
    FROM user_profiles
    WHERE status = 'active' AND (role = 'student' OR is_student = true);
    
    GET DIAGNOSTICS total_recipients = ROW_COUNT;
  ELSE
    RAISE EXCEPTION 'Invalid target_audience. Must be: all, tutors, or students';
  END IF;
  
  -- Log admin action
  INSERT INTO admin_actions (admin_id, action_type, details)
  VALUES (
    admin_user_id,
    'broadcast_notification',
    jsonb_build_object(
      'title', notification_title,
      'type', notification_type,
      'priority', notification_priority,
      'recipients', total_recipients,
      'target_audience', target_audience,
      'timestamp', NOW()
    )
  );
  
  result := json_build_object(
    'success', true,
    'recipients', total_recipients,
    'message', format('Notification sent to %s %s', total_recipients, 
      CASE 
        WHEN target_audience = 'tutors' THEN 'tutors'
        WHEN target_audience = 'students' THEN 'students'
        ELSE 'users'
      END)
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

-- Verify function exists
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'admin_broadcast_notification';
