-- Fix RLS policies to allow admins to see all users

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Create new policies that allow admins to see all users
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Also allow admins to update any user
CREATE POLICY "Admins can update any user" ON public.users 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete users
CREATE POLICY "Admins can delete users" ON public.users 
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);