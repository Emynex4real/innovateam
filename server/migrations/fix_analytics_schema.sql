-- ============================================
-- FIX ANALYTICS SCHEMA - Add Missing Columns
-- ============================================
-- Run this in Supabase SQL Editor to fix analytics errors

-- 1. Add missing columns to tc_student_attempts
ALTER TABLE tc_student_attempts 
ADD COLUMN IF NOT EXISTS center_id UUID REFERENCES tutorial_centers(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Add subject column to tc_question_sets
ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS subject TEXT;

-- 3. Populate center_id in tc_student_attempts from question_set_id
UPDATE tc_student_attempts sa
SET center_id = qs.center_id
FROM tc_question_sets qs
WHERE sa.question_set_id = qs.id
AND sa.center_id IS NULL;

-- 4. Populate created_at with completed_at for existing records
UPDATE tc_student_attempts
SET created_at = completed_at
WHERE created_at IS NULL;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tc_attempts_center ON tc_student_attempts(center_id);
CREATE INDEX IF NOT EXISTS idx_tc_attempts_created_at ON tc_student_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tc_question_sets_subject ON tc_question_sets(subject);

-- 6. Verify the changes
SELECT 
  'tc_student_attempts' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'tc_student_attempts'
AND column_name IN ('center_id', 'created_at')
ORDER BY column_name;

SELECT 
  'tc_question_sets' as table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'tc_question_sets'
AND column_name = 'subject';

-- ============================================
-- MIGRATION COMPLETE! ✅
-- ============================================
