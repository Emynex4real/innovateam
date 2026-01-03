-- Question Tagging System Migration
-- Run this in Supabase SQL Editor

-- 1. Add new columns to tc_questions table
ALTER TABLE tc_questions 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100),
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS year VARCHAR(10),
ADD COLUMN IF NOT EXISTS exam_type VARCHAR(50);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tc_questions_tags ON tc_questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tc_questions_category ON tc_questions(category);
CREATE INDEX IF NOT EXISTS idx_tc_questions_difficulty ON tc_questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_tc_questions_subject ON tc_questions(subject);

-- 3. Create tags table for autocomplete
CREATE TABLE IF NOT EXISTS tc_question_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name VARCHAR(100) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tc_question_tags_name ON tc_question_tags(tag_name);

-- 4. Function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update tag usage
  INSERT INTO tc_question_tags (tag_name, usage_count)
  SELECT unnest(NEW.tags), 1
  ON CONFLICT (tag_name) 
  DO UPDATE SET usage_count = tc_question_tags.usage_count + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger
DROP TRIGGER IF EXISTS trigger_update_tag_usage ON tc_questions;
CREATE TRIGGER trigger_update_tag_usage
AFTER INSERT OR UPDATE OF tags ON tc_questions
FOR EACH ROW
WHEN (NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0)
EXECUTE FUNCTION update_tag_usage();

-- 6. Predefined categories (JAMB-focused)
INSERT INTO tc_question_tags (tag_name, usage_count) VALUES
  ('algebra', 0),
  ('geometry', 0),
  ('calculus', 0),
  ('trigonometry', 0),
  ('statistics', 0),
  ('mechanics', 0),
  ('electricity', 0),
  ('waves', 0),
  ('organic-chemistry', 0),
  ('inorganic-chemistry', 0),
  ('biology', 0),
  ('ecology', 0),
  ('genetics', 0),
  ('literature', 0),
  ('grammar', 0),
  ('comprehension', 0),
  ('essay', 0),
  ('jamb-2024', 0),
  ('jamb-2023', 0),
  ('waec', 0),
  ('neco', 0),
  ('past-questions', 0),
  ('practice', 0),
  ('difficult', 0),
  ('frequently-asked', 0)
ON CONFLICT (tag_name) DO NOTHING;

-- 7. Update existing questions with default values
UPDATE tc_questions 
SET 
  difficulty_level = COALESCE(difficulty, 'medium'),
  category = subject,
  tags = ARRAY[LOWER(REPLACE(subject, ' ', '-'))]
WHERE tags IS NULL OR array_length(tags, 1) IS NULL;

-- 8. Verify migration
SELECT 
  COUNT(*) as total_questions,
  COUNT(CASE WHEN tags IS NOT NULL AND array_length(tags, 1) > 0 THEN 1 END) as tagged_questions,
  COUNT(DISTINCT category) as categories,
  COUNT(DISTINCT difficulty_level) as difficulty_levels
FROM tc_questions;

-- 9. Sample query to test
SELECT 
  id,
  question_text,
  subject,
  category,
  subcategory,
  difficulty_level,
  tags,
  array_length(tags, 1) as tag_count
FROM tc_questions
LIMIT 5;
