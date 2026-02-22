-- Performance Optimization: Add Missing Indexes
-- Run these in Supabase SQL Editor

-- 1. Tutorial Centers - frequently queried by tutor_id
CREATE INDEX IF NOT EXISTS idx_tutorial_centers_tutor_id 
ON tutorial_centers(tutor_id) 
WHERE deleted_at IS NULL;

-- 2. Enrollments - frequently queried by center_id and student_id
CREATE INDEX IF NOT EXISTS idx_tc_enrollments_center_student 
ON tc_enrollments(center_id, student_id);

-- 3. Questions - frequently queried by center_id
CREATE INDEX IF NOT EXISTS idx_tc_questions_center_id 
ON tc_questions(center_id);

-- 4. Question Sets - frequently queried by center_id
CREATE INDEX IF NOT EXISTS idx_tc_question_sets_center_id 
ON tc_question_sets(center_id) 
WHERE student_id IS NULL;

-- 5. Attempts - frequently queried by student_id and question_set_id
CREATE INDEX IF NOT EXISTS idx_tc_attempts_student_set 
ON tc_student_attempts(student_id, question_set_id);

-- 6. Attempts - frequently queried by completed_at for recent activity
CREATE INDEX IF NOT EXISTS idx_tc_attempts_completed_at 
ON tc_student_attempts(completed_at DESC);

-- Verify indexes created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'tc_%'
ORDER BY tablename, indexname;
