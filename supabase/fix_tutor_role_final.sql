-- ============================================
-- FIX USER_PROFILES ROLE FLAGS
-- ============================================

-- Update users who should be tutors
UPDATE user_profiles 
SET is_tutor = TRUE, is_student = FALSE, is_admin = FALSE 
WHERE email IN (
  -- Add emails of users who should be tutors
  'tutor1@example.com',
  'tutor2@example.com'
);

-- Update users who should be students (default)
UPDATE user_profiles 
SET is_student = TRUE, is_tutor = FALSE, is_admin = FALSE 
WHERE is_student IS NULL OR (is_student = FALSE AND is_tutor = FALSE AND is_admin = FALSE);

-- Verify the changes
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
        ELSE 'unknown'
    END as computed_role
FROM user_profiles
ORDER BY email;