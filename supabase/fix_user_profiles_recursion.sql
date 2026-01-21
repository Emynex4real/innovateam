-- Fix user_profiles recursion

DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;

-- Users can view their own profile
CREATE POLICY "user_select_own"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "user_update_own"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Admins can view all (NO RECURSION)
CREATE POLICY "admin_select_all_profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = true
  );

-- Admins can update all (NO RECURSION)
CREATE POLICY "admin_update_all_profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin FROM user_profiles WHERE id = auth.uid()) = true
  );
