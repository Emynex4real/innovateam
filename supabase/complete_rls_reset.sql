-- Complete RLS policy reset for tutorial_centers

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Students can view enrolled centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Admins can view all centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Admins can update any center" ON tutorial_centers;
DROP POLICY IF EXISTS "Admins can delete any center" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can manage their centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can view their centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can insert their centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can update their centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can delete their centers" ON tutorial_centers;

-- 2. Disable RLS temporarily
ALTER TABLE tutorial_centers DISABLE ROW LEVEL SECURITY;

-- 3. Re-enable RLS
ALTER TABLE tutorial_centers ENABLE ROW LEVEL SECURITY;

-- 4. Create clean, simple policies

-- Admin full access (SELECT)
CREATE POLICY "admin_select_all"
  ON tutorial_centers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Admin full access (UPDATE)
CREATE POLICY "admin_update_all"
  ON tutorial_centers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Admin full access (DELETE)
CREATE POLICY "admin_delete_all"
  ON tutorial_centers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- Tutor can view their own center
CREATE POLICY "tutor_select_own"
  ON tutorial_centers FOR SELECT
  TO authenticated
  USING (tutor_id = auth.uid());

-- Tutor can insert their own center
CREATE POLICY "tutor_insert_own"
  ON tutorial_centers FOR INSERT
  TO authenticated
  WITH CHECK (tutor_id = auth.uid());

-- Tutor can update their own center
CREATE POLICY "tutor_update_own"
  ON tutorial_centers FOR UPDATE
  TO authenticated
  USING (tutor_id = auth.uid());

-- Tutor can delete their own center
CREATE POLICY "tutor_delete_own"
  ON tutorial_centers FOR DELETE
  TO authenticated
  USING (tutor_id = auth.uid());

-- Students can view enrolled centers (non-deleted, non-suspended)
CREATE POLICY "student_select_enrolled"
  ON tutorial_centers FOR SELECT
  TO authenticated
  USING (
    is_suspended = false 
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tutorial_centers.id 
      AND tc_enrollments.student_id = auth.uid()
    )
  );

-- 5. Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'tutorial_centers'
ORDER BY policyname;
