-- Migration: Add attempt limits to tests
-- Run this in Supabase SQL Editor

-- Add columns to tc_question_sets table
ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS cooldown_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_policy VARCHAR(20) DEFAULT 'best';

-- Add comments for documentation
COMMENT ON COLUMN tc_question_sets.max_attempts IS 'Maximum number of attempts allowed (NULL = unlimited)';
COMMENT ON COLUMN tc_question_sets.cooldown_hours IS 'Hours to wait between attempts (0 = no cooldown)';
COMMENT ON COLUMN tc_question_sets.score_policy IS 'How to calculate final score: best, average, last, first';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attempts_student_test 
ON tc_student_attempts(student_id, question_set_id, completed_at DESC);
