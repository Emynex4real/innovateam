-- Temporarily disable RLS to fix admin access
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow user profile access" ON public.users;
DROP POLICY IF EXISTS "Allow user profile updates" ON public.users;
DROP POLICY IF EXISTS "Allow admin to delete users" ON public.users;