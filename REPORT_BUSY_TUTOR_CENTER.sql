-- ============================================
-- WEEKLY REPORT FOR: Busy Tutor Center
-- ============================================
-- Center ID: febf2573-4c57-4437-aa08-92f655d91386
-- Tutor: busybrains@gmail.com

-- ============================================
-- 1. TOP 5 STUDENTS BY XP
-- ============================================
WITH student_xp AS (
  SELECT 
    sa.student_id,
    up.full_name,
    up.email,
    SUM(sa.score) as total_xp,
    COUNT(sa.id) as tests_taken,
    ROUND(AVG(sa.score)) as avg_score
  FROM tc_student_attempts sa
  JOIN tc_question_sets qs ON qs.id = sa.question_set_id
  JOIN user_profiles up ON up.id = sa.student_id
  WHERE qs.center_id = 'febf2573-4c57-4437-aa08-92f655d91386'
    AND sa.completed_at >= NOW() - INTERVAL '7 days'
  GROUP BY sa.student_id, up.full_name, up.email
  ORDER BY total_xp DESC
  LIMIT 5
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY total_xp DESC) as rank,
  full_name as "Student Name",
  total_xp as "XP Earned",
  tests_taken as "Tests Taken",
  avg_score as "Avg Score %"
FROM student_xp;

-- ============================================
-- 2. AT-RISK STUDENTS
-- ============================================
WITH recent_performance AS (
  SELECT 
    e.student_id,
    up.full_name,
    up.email,
    COUNT(sa.id) as tests_taken,
    ROUND(AVG(sa.score)) as avg_score,
    MAX(sa.completed_at) as last_activity,
    100 as integrity_score
  FROM tc_enrollments e
  JOIN user_profiles up ON up.id = e.student_id
  LEFT JOIN tc_student_attempts sa ON sa.student_id = e.student_id
  LEFT JOIN tc_question_sets qs ON qs.id = sa.question_set_id AND qs.center_id = e.center_id
  WHERE e.center_id = 'febf2573-4c57-4437-aa08-92f655d91386'
  GROUP BY e.student_id, up.full_name, up.email
)
SELECT 
  full_name as "Student Name",
  email as "Email",
  COALESCE(tests_taken, 0) as "Tests Taken",
  COALESCE(avg_score, 0) as "Avg Score %",
  integrity_score as "Integrity Score",
  CASE 
    WHEN last_activity IS NULL THEN 'Never Active'
    WHEN last_activity < NOW() - INTERVAL '7 days' THEN 'Inactive 7+ days'
    ELSE 'Active'
  END as "Status",
  CASE
    WHEN last_activity IS NULL THEN 'No tests taken'
    WHEN last_activity < NOW() - INTERVAL '7 days' THEN 'Disengaged'
    WHEN avg_score < 40 THEN 'Failing'
    WHEN integrity_score < 50 THEN 'Integrity issues'
    ELSE 'At risk'
  END as "Risk Reason"
FROM recent_performance
WHERE 
  last_activity IS NULL OR
  last_activity < NOW() - INTERVAL '7 days' OR
  avg_score < 50 OR
  integrity_score < 60
ORDER BY 
  CASE 
    WHEN last_activity IS NULL THEN 1
    WHEN avg_score < 40 THEN 2
    WHEN integrity_score < 50 THEN 3
    ELSE 4
  END;

-- ============================================
-- 3. SUBJECT-WISE GAPS
-- ============================================
WITH subject_performance AS (
  SELECT 
    q.subject,
    COUNT(DISTINCT sa.student_id) as students_attempted,
    COUNT(sa.id) as total_attempts,
    ROUND(AVG(sa.score)) as avg_score,
    COUNT(CASE WHEN sa.score < 50 THEN 1 END) as failing_attempts,
    ROUND(100.0 * COUNT(CASE WHEN sa.score < 50 THEN 1 END) / COUNT(sa.id)) as failure_rate
  FROM tc_student_attempts sa
  JOIN tc_question_sets qs ON qs.id = sa.question_set_id
  JOIN tc_question_set_items qsi ON qsi.question_set_id = qs.id
  JOIN tc_questions q ON q.id = qsi.question_id
  WHERE qs.center_id = 'febf2573-4c57-4437-aa08-92f655d91386'
    AND sa.completed_at >= NOW() - INTERVAL '7 days'
  GROUP BY q.subject
  HAVING COUNT(sa.id) >= 5
)
SELECT 
  subject as "Subject",
  students_attempted as "Students",
  total_attempts as "Total Attempts",
  avg_score as "Avg Score %",
  failure_rate as "Failure Rate %",
  CASE
    WHEN failure_rate >= 70 THEN '🔴 Critical'
    WHEN failure_rate >= 50 THEN '🟡 Needs Attention'
    ELSE '🟢 Good'
  END as "Status"
FROM subject_performance
WHERE failure_rate >= 50
ORDER BY failure_rate DESC;

-- ============================================
-- 4. WEEKLY SUMMARY
-- ============================================
SELECT 
  COUNT(DISTINCT e.student_id) as "Total Students",
  COUNT(DISTINCT sa.student_id) as "Active This Week",
  COUNT(sa.id) as "Total Tests Taken",
  ROUND(AVG(sa.score)) as "Center Avg Score %",
  COUNT(DISTINCT qs.id) as "Tests Available",
  COUNT(CASE WHEN sa.score >= 70 THEN 1 END) as "Passing Attempts",
  ROUND(100.0 * COUNT(CASE WHEN sa.score >= 70 THEN 1 END) / COUNT(sa.id)) as "Pass Rate %"
FROM tc_enrollments e
LEFT JOIN tc_student_attempts sa ON sa.student_id = e.student_id 
  AND sa.completed_at >= NOW() - INTERVAL '7 days'
LEFT JOIN tc_question_sets qs ON qs.center_id = e.center_id
WHERE e.center_id = 'febf2573-4c57-4437-aa08-92f655d91386';
