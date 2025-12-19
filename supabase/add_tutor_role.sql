-- Add tutor role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tutor';

-- Update users table to allow tutor role (already supports it via enum)
-- No changes needed to table structure

-- Add RLS policy for tutors to access tutorial center features
-- (Already handled in tutorial_center_migration.sql)

-- Optional: Update existing users if needed
-- UPDATE public.users SET role = 'tutor' WHERE email = 'your-tutor-email@example.com';
