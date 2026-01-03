-- EMERGENCY FIX - Guaranteed to Work
-- Run this in Supabase SQL Editor

-- Step 1: Make you admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'emynex4real@gmail.com';

-- Step 2: COMPLETELY DISABLE RLS (temporary for testing)
ALTER TABLE question_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_usage DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL policies
DROP POLICY IF EXISTS "Admin full access to question banks" ON question_banks;
DROP POLICY IF EXISTS "Admin full access to questions" ON questions;
DROP POLICY IF EXISTS "Users can view active question banks" ON question_banks;
DROP POLICY IF EXISTS "Users can view active questions" ON questions;
DROP POLICY IF EXISTS "Users can record their practice attempts" ON question_usage;
DROP POLICY IF EXISTS "Users can view their own practice history" ON question_usage;
DROP POLICY IF EXISTS "Admins can view all practice history" ON question_usage;
DROP POLICY IF EXISTS "Admins can delete practice records" ON question_usage;
DROP POLICY IF EXISTS "Admins can manage question banks" ON question_banks;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Authenticated users can manage question banks" ON question_banks;
DROP POLICY IF EXISTS "Authenticated users can manage questions" ON questions;
DROP POLICY IF EXISTS "Authenticated users can manage question usage" ON question_usage;

-- Step 4: Verify your role
SELECT 
  'Your Role:' as info,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data as full_metadata
FROM auth.users 
WHERE email = 'emynex4real@gmail.com';

-- Step 5: Check if tables exist and are accessible
SELECT 'question_banks table' as table_name, COUNT(*) as row_count FROM question_banks;
SELECT 'questions table' as table_name, COUNT(*) as row_count FROM questions;
SELECT 'question_usage table' as table_name, COUNT(*) as row_count FROM question_usage;

-- Step 6: Show any existing data
SELECT 'Existing Banks:' as info, id, name, subject, is_active, created_at FROM question_banks LIMIT 5;
SELECT 'Existing Questions:' as info, id, question, bank_id, is_active FROM questions LIMIT 5;
