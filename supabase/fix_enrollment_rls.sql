-- Fix RLS policy to allow students to query their enrollments for theme loading

-- Drop existing policy
DROP POLICY IF EXISTS "Students can view their enrollments" ON tc_enrollments;

-- Recreate with proper permissions
CREATE POLICY "Students can view their enrollments"
  ON tc_enrollments FOR SELECT
  USING (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM tutorial_centers 
      WHERE tutorial_centers.id = tc_enrollments.center_id 
      AND tutorial_centers.tutor_id = auth.uid()
    )
  );
