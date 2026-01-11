-- Drop ALL triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_sync_email ON auth.users;

-- Drop their functions
DROP FUNCTION IF EXISTS public.handle_new_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_email() CASCADE;

-- Verify only one trigger remains
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users' AND event_object_schema = 'auth';
