-- Fix Question Bank RLS Policies
-- This fixes the infinite recursion error

-- Step 1: Make your user an admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'emynex4real@gmail.com';

-- Step 2: Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can manage question banks" ON question_banks;
DROP POLICY IF EXISTS "Admins can manage questions" ON questions;
DROP POLICY IF EXISTS "Users can view active questions" ON questions;
DROP POLICY IF EXISTS "Users can view active question banks" ON question_banks;
DROP POLICY IF EXISTS "Users can track their question usage" ON question_usage;
DROP POLICY IF EXISTS "Users can view their usage" ON question_usage;
DROP POLICY IF EXISTS "Admins can view all usage" ON question_usage;

-- Step 3: Create simple, non-recursive policies

-- Admin can do everything on question_banks (check role directly from auth.users)
CREATE POLICY "Admins can manage question banks" ON question_banks
  FOR ALL 
  USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR 
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Admin can do everything on questions
CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL 
  USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR 
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Users can view active questions (no recursion)
CREATE POLICY "Users can view active questions" ON questions
  FOR SELECT 
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- Users can view active question banks (no recursion)
CREATE POLICY "Users can view active question banks" ON question_banks
  FOR SELECT 
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- Question usage policies (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'question_usage') THEN
    -- Users can insert their own usage records
    EXECUTE 'CREATE POLICY "Users can track their question usage" ON question_usage
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id)';

    -- Users can view their own usage
    EXECUTE 'CREATE POLICY "Users can view their usage" ON question_usage
      FOR SELECT 
      USING (auth.uid() = user_id)';

    -- Admins can view all usage
    EXECUTE 'CREATE POLICY "Admins can view all usage" ON question_usage
      FOR SELECT 
      USING (
        (auth.jwt() ->> ''role'') = ''admin'' 
        OR 
        (SELECT raw_user_meta_data->>''role'' FROM auth.users WHERE id = auth.uid()) = ''admin''
      )';
  END IF;
END $$;

-- Step 4: Verify the fix
SELECT 
  'User Role Check' as check_type,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'emynex4real@gmail.com';

-- Step 5: Test table access
SELECT 'Table Access Test' as check_type, COUNT(*) as count FROM question_banks;
SELECT 'Table Access Test' as check_type, COUNT(*) as count FROM questions;
