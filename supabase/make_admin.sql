-- Make user admin by email
-- Replace 'your-email@example.com' with your actual email

UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, role, full_name 
FROM public.users 
WHERE email = 'your-email@example.com';