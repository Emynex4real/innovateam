-- PROPER PRODUCTION-READY FIX: Question Bank RLS Policies
-- This ensures proper security while fixing the infinite recursion

-- Step 1: Make your user an admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'emynex4real@gmail.com';

-- Step 2: Temporarily disable RLS to clear errors
ALTER TABLE question_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE question_usage DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies
DROP POLICY IF EXISTS "Admins can manage question banks" ON question_banks;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Users can view active questions" ON questions;
DROP POLICY IF EXISTS "Users can view active question banks" ON question_banks;
DROP POLICY IF EXISTS "Users can track their question usage" ON question_usage;
DROP POLICY IF EXISTS "Users can view their usage" ON question_usage;
DROP POLICY IF EXISTS "Admins can view all usage" ON question_usage;

-- Step 4: Re-enable RLS
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_usage ENABLE ROW LEVEL SECURITY;

-- Step 5: Create PROPER policies with correct security

-- ============================================
-- QUESTION BANKS POLICIES
-- ============================================

-- Admins can do EVERYTHING with question banks
CREATE POLICY "Admin full access to question banks" ON question_banks
  FOR ALL 
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Regular users can ONLY VIEW active question banks (for practice)
CREATE POLICY "Users can view active question banks" ON question_banks
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
  );

-- ============================================
-- QUESTIONS POLICIES
-- ============================================

-- Admins can do EVERYTHING with questions
CREATE POLICY "Admin full access to questions" ON questions
  FOR ALL 
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Regular users can ONLY VIEW active questions (for practice)
CREATE POLICY "Users can view active questions" ON questions
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
  );

-- ============================================
-- QUESTION USAGE POLICIES (for tracking practice)
-- ============================================

-- Users can INSERT their own practice attempts
CREATE POLICY "Users can record their practice attempts" ON question_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Users can VIEW their own practice history
CREATE POLICY "Users can view their own practice history" ON question_usage
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
  );

-- Admins can VIEW all practice history (for analytics)
CREATE POLICY "Admins can view all practice history" ON question_usage
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Admins can DELETE practice records (for cleanup)
CREATE POLICY "Admins can delete practice records" ON question_usage
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Step 6: Verify the setup
SELECT 
  '✅ User Role Updated' as status,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'emynex4real@gmail.com';

-- Test table access
SELECT '✅ Question Banks Accessible' as status, COUNT(*) as count FROM question_banks;
SELECT '✅ Questions Accessible' as status, COUNT(*) as count FROM questions;
SELECT '✅ Question Usage Accessible' as status, COUNT(*) as count FROM question_usage;

-- Show current policies
SELECT 
  '✅ Active Policies' as status,
  schemaname,
  tablename,
  policyname,
  cmd as operation
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('question_banks', 'questions', 'question_usage')
ORDER BY tablename, policyname;
