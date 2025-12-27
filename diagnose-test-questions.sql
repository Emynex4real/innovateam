-- DIAGNOSTIC: Find why students can't see questions
-- Run each section separately to diagnose the issue

-- 1. Check if questions exist in junction table
SELECT 
  qsq.question_set_id,
  qs.title as test_name,
  qs.tutor_id,
  qs.center_id,
  qs.visibility,
  qs.is_active,
  qs.created_at,
  COUNT(qsq.id) as questions_in_test
FROM tc_question_set_questions qsq
JOIN tc_question_sets qs ON qsq.question_set_id = qs.id
GROUP BY qsq.question_set_id, qs.title, qs.tutor_id, qs.center_id, qs.visibility, qs.is_active, qs.created_at
ORDER BY qs.created_at DESC;

-- 2. Check student enrollment (replace STUDENT_USER_ID)
-- SELECT 
--   e.student_id,
--   e.center_id,
--   tc.name as center_name,
--   tc.tutor_id
-- FROM tc_enrollments e
-- JOIN tutorial_centers tc ON e.center_id = tc.id
-- WHERE e.student_id = 'STUDENT_USER_ID';

-- 3. Full test details with questions (replace TEST_ID)
-- SELECT 
--   qs.id as test_id,
--   qs.title,
--   qs.visibility,
--   qs.is_active,
--   qs.center_id,
--   qsq.order_index,
--   q.id as question_id,
--   q.question_text,
--   q.subject
-- FROM tc_question_sets qs
-- LEFT JOIN tc_question_set_questions qsq ON qs.id = qsq.question_set_id
-- LEFT JOIN tc_questions q ON qsq.question_id = q.id
-- WHERE qs.id = 'TEST_ID'
-- ORDER BY qsq.order_index;

-- 4. Check if student can access test (replace STUDENT_ID and TEST_ID)
-- SELECT 
--   qs.id,
--   qs.title,
--   qs.visibility,
--   CASE 
--     WHEN qs.visibility = 'public' THEN 'Public - Should be accessible'
--     WHEN EXISTS (
--       SELECT 1 FROM tc_enrollments e 
--       WHERE e.center_id = qs.center_id 
--       AND e.student_id = 'STUDENT_ID'
--     ) THEN 'Private - Student is enrolled'
--     ELSE 'Private - Student NOT enrolled'
--   END as access_status
-- FROM tc_question_sets qs
-- WHERE qs.id = 'TEST_ID';
