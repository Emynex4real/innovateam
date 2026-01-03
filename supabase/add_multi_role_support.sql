-- Add multi-role columns to user_profiles table
-- This is the PROPER way to handle multiple roles

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_tutor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT TRUE;

-- Migrate existing data based on current role column
UPDATE public.user_profiles
SET 
  is_admin = (role = 'admin'),
  is_tutor = (role = 'tutor'),
  is_student = (role = 'student' OR role = 'user');

-- Make emynex4real@gmail.com both admin AND tutor
UPDATE public.user_profiles
SET 
  is_admin = TRUE,
  is_tutor = TRUE,
  is_student = FALSE
WHERE email = 'emynex4real@gmail.com';

-- Verify
SELECT 
  email,
  role as old_role,
  is_admin,
  is_tutor,
  is_student
FROM public.user_profiles
WHERE email = 'emynex4real@gmail.com';

-- Note: Keep 'role' column for backward compatibility
-- It will represent the PRIMARY role for simple checks
