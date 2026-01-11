-- Find your user ID and make yourself admin
UPDATE public.user_profiles
SET is_admin = true, role = 'admin'
WHERE email = 'YOUR_EMAIL_HERE';  -- Replace with your actual email

-- Verify
SELECT id, email, role, is_admin FROM public.user_profiles WHERE is_admin = true;
