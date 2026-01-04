-- ============================================
-- GET ACTUAL IDs FOR TESTING
-- ============================================
-- Run these queries FIRST to get real IDs
-- Then copy those IDs into the other SQL files

-- ============================================
-- 1. GET CENTER IDs
-- ============================================

-- Get all centers with their IDs
SELECT 
  id as center_id,
  name as center_name,
  tutor_id,
  access_code,
  created_at
FROM tutorial_centers
ORDER BY created_at DESC
LIMIT 10;

-- Copy one of the 'center_id' values from above
-- Example: 123e4567-e89b-12d3-a456-426614174000

-- ============================================
-- 2. GET STUDENT IDs
-- ============================================

-- Get students enrolled in centers
SELECT 
  e.student_id,
  up.email as student_email,
  up.full_name as student_name,
  tc.name as center_name,
  tc.id as center_id
FROM tc_enrollments e
JOIN user_profiles up ON up.id = e.student_id
JOIN tutorial_centers tc ON tc.id = e.center_id
ORDER BY e.enrolled_at DESC
LIMIT 10;

-- Copy one of the 'student_id' values from above
-- Example: 987e6543-e21b-12d3-a456-426614174999

-- ============================================
-- 3. GET TUTOR IDs
-- ============================================

-- Get tutors who own centers
SELECT 
  u.id as tutor_id,
  u.email as tutor_email,
  tc.id as center_id,
  tc.name as center_name
FROM auth.users u
JOIN tutorial_centers tc ON tc.tutor_id = u.id
ORDER BY tc.created_at DESC
LIMIT 10;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- 1. Run the queries above
-- 2. Copy the actual UUID values
-- 3. Replace placeholders in other SQL files:
--    - Replace <CENTER_ID> with actual center_id
--    - Replace <TEST_CENTER_ID> with actual center_id
--    - Replace <TEST_STUDENT_ID> with actual student_id
--    - Replace <TUTOR_USER_ID> with actual tutor_id
--
-- Example:
--   Before: WHERE center_id = '<CENTER_ID>'
--   After:  WHERE center_id = '123e4567-e89b-12d3-a456-426614174000'
-- ============================================
