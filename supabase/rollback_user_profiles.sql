-- ROLLBACK: Restore original user_profiles policies

DROP POLICY IF EXISTS "user_select_own" ON user_profiles;
DROP POLICY IF EXISTS "user_update_own" ON user_profiles;
DROP POLICY IF EXISTS "admin_select_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON user_profiles;

-- Restore original policies
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING ((id = auth.uid()) OR is_admin());

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING ((id = auth.uid()) OR is_admin());
