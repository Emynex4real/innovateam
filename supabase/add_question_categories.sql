-- Add category field to questions for class-based organization
-- Run this in Supabase SQL Editor

-- Add category column
ALTER TABLE tc_questions 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tc_questions_category ON tc_questions(category);

-- Add comment
COMMENT ON COLUMN tc_questions.category IS 'Student class category: Science, Commercial, Arts, General, etc.';
