-- Performance indexes for slow queries
-- Run this in Supabase SQL Editor

-- Speed up /my-attempts (was 3.5s)
CREATE INDEX IF NOT EXISTS idx_tc_student_attempts_student ON tc_student_attempts(student_id);

-- Speed up /my-centers (was 3.5s)
CREATE INDEX IF NOT EXISTS idx_tc_enrollments_student ON tc_enrollments(student_id);

-- Speed up streak/league queries
CREATE INDEX IF NOT EXISTS idx_tc_student_attempts_center_student ON tc_student_attempts(center_id, student_id);

-- Speed up notifications polling
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- Speed up conversations
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Speed up question sets lookup
CREATE INDEX IF NOT EXISTS idx_tc_question_sets_center ON tc_question_sets(center_id);

-- Speed up question lookups
CREATE INDEX IF NOT EXISTS idx_tc_questions_tutor ON tc_questions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tc_questions_center ON tc_questions(center_id);
