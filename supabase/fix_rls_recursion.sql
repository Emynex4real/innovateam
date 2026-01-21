-- Fix infinite recursion in tutorial_centers RLS policies

-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all centers" ON tutorial_centers;
DROP POLICY IF EXISTS "Admins can update any center" ON tutorial_centers;

-- Create simplified admin policies (no recursion)
CREATE POLICY "Admins can view all centers"
  ON tutorial_centers FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = TRUE
  );

CREATE POLICY "Admins can update any center"
  ON tutorial_centers FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = TRUE
  );

CREATE POLICY "Admins can delete any center"
  ON tutorial_centers FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = TRUE
  );
