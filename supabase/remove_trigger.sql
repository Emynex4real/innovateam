-- REMOVE THE PROBLEMATIC TRIGGER
-- Run this immediately to fix registration

DROP TRIGGER IF EXISTS set_user_role_flags ON user_profiles;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();