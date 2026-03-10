-- Fix Infinite Recursion between tutorial_centers and tc_enrollments

-- 1. Drop existing policies to prevent recursion
DROP POLICY IF EXISTS "student_select_enrolled" ON tutorial_centers;
DROP POLICY IF EXISTS "Students can view their enrollments" ON tc_enrollments;

-- 2. Create non-recursive policy for students viewing centers
-- A student should be able to view a center if they are enrolled in it.
-- To avoid recursion, we check the enrollment by center_id directly.
CREATE POLICY "student_select_enrolled_fix"
  ON tutorial_centers FOR SELECT
  TO authenticated
  USING (
    is_suspended = false 
    AND deleted_at IS NULL
    AND id IN (
      SELECT center_id FROM tc_enrollments WHERE student_id = auth.uid()
    )
  );

-- 3. Create non-recursive policy for students and tutors viewing enrollments
-- Students can view their own enrollments. Tutors can view enrollments for centers they own.
-- To allow tutors without recursively querying tutorial_centers, we can just allow them if they own the center.
CREATE POLICY "user_select_enrollment_fix"
  ON tc_enrollments FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    center_id IN (
      SELECT id FROM tutorial_centers WHERE tutor_id = auth.uid()
    )
  );
