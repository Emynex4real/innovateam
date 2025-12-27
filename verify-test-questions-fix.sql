-- Verification Script for Test Questions Fix
-- Run this in your Supabase SQL Editor to verify the fix

-- 1. Check if the correct table exists
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'tc_question_set_questions'
ORDER BY ordinal_position;

-- Expected columns:
-- id, question_set_id, question_id, order_index, points, created_at

-- 2. Check for any data in the wrong table (if it exists)
SELECT COUNT(*) as wrong_table_count
FROM information_schema.tables
WHERE table_name = 'tc_question_set_items';

-- 3. Count questions in tests
SELECT 
  qs.id as test_id,
  qs.title as test_name,
  COUNT(qsq.id) as question_count
FROM tc_question_sets qs
LEFT JOIN tc_question_set_questions qsq ON qs.id = qsq.question_set_id
GROUP BY qs.id, qs.title
ORDER BY qs.created_at DESC
LIMIT 10;

-- 4. Verify a specific test has questions
-- Replace 'YOUR_TEST_ID' with an actual test ID
/*
SELECT 
  qsq.order_index,
  q.question_text,
  q.subject,
  q.difficulty
FROM tc_question_set_questions qsq
JOIN tc_questions q ON qsq.question_id = q.id
WHERE qsq.question_set_id = 'YOUR_TEST_ID'
ORDER BY qsq.order_index;
*/

-- 5. Check RLS policies are correct
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'tc_question_set_questions';
