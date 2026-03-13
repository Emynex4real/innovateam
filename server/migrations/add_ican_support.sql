-- Migration: Add ICAN professional exam support to past_questions
-- Adds 'ican' as valid exam_body and adds ICAN-specific columns

-- Step 1: Drop and recreate the CHECK constraint to include 'ican'
ALTER TABLE past_questions DROP CONSTRAINT IF EXISTS past_questions_exam_body_check;
ALTER TABLE past_questions ADD CONSTRAINT past_questions_exam_body_check
  CHECK (exam_body IN ('jamb', 'waec', 'neco', 'nabteb', 'ican'));

-- Step 2: Add ICAN-specific columns (nullable so existing rows are unaffected)
ALTER TABLE past_questions ADD COLUMN IF NOT EXISTS diet TEXT;
ALTER TABLE past_questions ADD COLUMN IF NOT EXISTS skill_level TEXT;

-- Step 3: Add index for ICAN queries
CREATE INDEX IF NOT EXISTS idx_past_questions_ican_diet ON past_questions(diet) WHERE exam_body = 'ican';
CREATE INDEX IF NOT EXISTS idx_past_questions_ican_skill ON past_questions(skill_level) WHERE exam_body = 'ican';

-- ICAN diet values: 'march', 'may', 'november'
-- ICAN skill_level values: 'foundation', 'skills', 'professional'
