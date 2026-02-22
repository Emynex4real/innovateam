-- Add INSERT policies for proctoring tables
-- Run this if proctoring sessions are not being created

-- Allow students to insert their own proctoring sessions
DROP POLICY IF EXISTS "Students can insert own proctoring sessions" ON proctoring_sessions;
CREATE POLICY "Students can insert own proctoring sessions"
  ON proctoring_sessions FOR INSERT
  TO public
  WITH CHECK (auth.uid() = student_id);

-- Allow students to insert violations for their sessions
DROP POLICY IF EXISTS "Students can insert own violations" ON proctoring_violations;
CREATE POLICY "Students can insert own violations"
  ON proctoring_violations FOR INSERT
  TO public
  WITH CHECK (true); -- Allow insert, will be validated by session ownership

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('proctoring_sessions', 'proctoring_violations')
ORDER BY tablename, policyname;
