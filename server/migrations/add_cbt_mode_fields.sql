-- Migration: Add CBT (Computer-Based Test) simulator fields to tc_question_sets
-- Enables JAMB/WAEC exam simulation mode for tests

ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS is_cbt_mode BOOLEAN DEFAULT false;

ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'custom';

-- exam_type values: 'jamb', 'waec', 'custom'
COMMENT ON COLUMN tc_question_sets.is_cbt_mode IS 'When true, test uses the CBT simulator interface resembling real JAMB/WAEC exams';
COMMENT ON COLUMN tc_question_sets.exam_type IS 'Exam type: jamb, waec, or custom. Affects CBT simulator UI styling';
