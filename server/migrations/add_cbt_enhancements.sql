-- Migration: Add CBT enhancement fields to tc_question_sets
-- Enables question shuffling and lockdown mode for CBT tests

ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT false;

ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS enable_lockdown BOOLEAN DEFAULT false;

COMMENT ON COLUMN tc_question_sets.shuffle_questions IS 'When true, question order is randomized per student using a seeded shuffle';
COMMENT ON COLUMN tc_question_sets.enable_lockdown IS 'When true, enforces strict fullscreen lockdown during CBT test';
