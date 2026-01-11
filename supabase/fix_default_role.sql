-- FIX THE DEFAULT ROLE VALUE
-- Change from 'user' to 'student'

ALTER TABLE user_profiles 
ALTER COLUMN role SET DEFAULT 'student';

-- Update existing 'user' roles to 'student'
UPDATE user_profiles 
SET role = 'student'
WHERE role = 'user';

-- Verify the fix
SELECT role, COUNT(*) as count
FROM user_profiles
GROUP BY role;