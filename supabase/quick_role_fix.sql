-- FIX: Change user roles in the users table
-- This is the ONLY table we're using now

-- Make specific user a tutor
UPDATE users 
SET role = 'tutor'
WHERE email = 'your-tutor-email@example.com';

-- Make specific user a student
UPDATE users 
SET role = 'student'
WHERE email = 'your-student-email@example.com';

-- Make specific user an admin
UPDATE users 
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';

-- Check the results
SELECT email, full_name, role, wallet_balance FROM users ORDER BY created_at DESC;