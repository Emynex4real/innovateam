-- Fix type constraint on notifications table
-- Run this in Supabase SQL Editor

-- 1. Check current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.notifications'::regclass 
AND conname LIKE '%type%';

-- 2. Drop old constraint
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- 3. Add new constraint with all types
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('info', 'success', 'warning', 'error', 'announcement', 'system', 'alert'));

-- 4. Verify
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.notifications'::regclass 
AND conname = 'notifications_type_check';
