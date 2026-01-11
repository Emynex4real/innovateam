-- FIX ALL EXISTING USERS IN user_profiles
-- Set all users to student by default (since all flags are FALSE)

-- 1. Set all existing users to student role
UPDATE user_profiles 
SET is_student = TRUE, is_tutor = FALSE, is_admin = FALSE
WHERE is_student = FALSE AND is_tutor = FALSE AND is_admin = FALSE;

-- 2. Make specific users tutors (replace with actual emails)
UPDATE user_profiles 
SET is_tutor = TRUE, is_student = FALSE, is_admin = FALSE
WHERE email IN (
  'tutor1@example.com',
  'tutor2@example.com'
);

-- 3. Make specific users admins (replace with actual emails)
UPDATE user_profiles 
SET is_admin = TRUE, is_student = FALSE, is_tutor = FALSE
WHERE email IN (
  'admin@example.com'
);

-- 4. Verify the fix
SELECT 
  email,
  full_name,
  is_admin,
  is_tutor,
  is_student,
  CASE 
    WHEN is_admin THEN 'admin'
    WHEN is_tutor THEN 'tutor'
    WHEN is_student THEN 'student'
    ELSE 'NO ROLE SET'
  END as computed_role
FROM user_profiles
ORDER BY email;