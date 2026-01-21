-- EMERGENCY: Remove ALL insecure policies and create secure ones

-- Drop ALL policies (including the dangerous public ones)
DROP POLICY IF EXISTS "Allow authenticated users to read tutorial centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Allow public read tutorial centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can create centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can create their own center" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can delete own center" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can update own center" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can update their own center" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can view own center" ON tutorial_centers;
DROP POLICY IF EXISTS "Tutors can view their own center" ON tutorial_centers;
DROP POLICY IF EXISTS "Users can view tutorial centers" ON tutorial_centers;
DROP POLICY IF EXISTS "admin_delete_all" ON tutorial_centers;
DROP POLICY IF EXISTS "admin_select_all" ON tutorial_centers;
DROP POLICY IF EXISTS "admin_update_all" ON tutorial_centers;
DROP POLICY IF EXISTS "admins_view_all_centers" ON tutorial_centers;
DROP POLICY IF EXISTS "student_select_enrolled" ON tutorial_centers;
DROP POLICY IF EXISTS "tutor_delete_own" ON tutorial_centers;
DROP POLICY IF EXISTS "tutor_insert_own" ON tutorial_centers;
DROP POLICY IF EXISTS "tutor_select_own" ON tutorial_centers;
DROP POLICY IF EXISTS "tutor_update_own" ON tutorial_centers;
DROP POLICY IF EXISTS "tutors_manage_own_center" ON tutorial_centers;
DROP POLICY IF EXISTS "tutors_view_own_center" ON tutorial_centers;
DROP POLICY IF EXISTS "Students can view enrolled centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Admins can view all centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Admins can update any center" ON tutorial_centers;
DROP POLICY IF EXISTS "Admins can delete any center" ON tutorial_centers;

-- Create ONLY 5 secure policies

-- 1. Admin SELECT
CREATE POLICY "admin_select"
  ON tutorial_centers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- 2. Admin UPDATE
CREATE POLICY "admin_update"
  ON tutorial_centers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- 3. Admin DELETE
CREATE POLICY "admin_delete"
  ON tutorial_centers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

-- 4. Tutor full access to OWN center
CREATE POLICY "tutor_own_center"
  ON tutorial_centers FOR ALL
  TO authenticated
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());

-- 5. Student view ENROLLED centers only
CREATE POLICY "student_enrolled"
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

-- Verify (should show ONLY 5 policies)
SELECT policyname, roles, cmd, 
  CASE 
    WHEN qual::text LIKE '%true%' THEN '⚠️ INSECURE'
    ELSE '✅ SECURE'
  END as security_status
FROM pg_policies
WHERE tablename = 'tutorial_centers'
ORDER BY policyname;
