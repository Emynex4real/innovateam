-- Fix admin access by simplifying RLS policies

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;

-- Create simple policies that work
CREATE POLICY "Allow user profile access" ON public.users 
FOR SELECT USING (
  auth.uid() = id OR 
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Allow user profile updates" ON public.users 
FOR UPDATE USING (
  auth.uid() = id OR 
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Allow admin to delete users" ON public.users 
FOR DELETE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);