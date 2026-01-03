-- ============================================
-- PUBLIC/PRIVATE TEST SYSTEM
-- ============================================

-- Add visibility column to tc_question_sets
ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' 
CHECK (visibility IN ('private', 'public'));

-- Add metadata columns
ALTER TABLE tc_question_sets 
ADD COLUMN IF NOT EXISTS total_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Update RLS policies for public tests
DROP POLICY IF EXISTS "Students can view active sets from enrolled centers" ON tc_question_sets;

-- New policy: Students can view public tests OR tests from enrolled centers
CREATE POLICY "Students can view public or enrolled tests" 
ON tc_question_sets FOR SELECT
USING (
  is_active = TRUE AND (
    visibility = 'public' OR
    EXISTS (
      SELECT 1 FROM tc_enrollments 
      WHERE tc_enrollments.center_id = tc_question_sets.center_id 
      AND tc_enrollments.student_id = auth.uid()
    )
  )
);

-- Update question set items policy for public tests
DROP POLICY IF EXISTS "Students can view items from enrolled centers" ON tc_question_set_items;

CREATE POLICY "Students can view items from public or enrolled tests"
ON tc_question_set_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tc_question_sets qs
    WHERE qs.id = tc_question_set_items.question_set_id 
    AND qs.is_active = TRUE
    AND (
      qs.visibility = 'public' OR
      EXISTS (
        SELECT 1 FROM tc_enrollments e 
        WHERE e.center_id = qs.center_id 
        AND e.student_id = auth.uid()
      )
    )
  )
);

-- Update questions policy for public tests
DROP POLICY IF EXISTS "Students can view questions from enrolled centers" ON tc_questions;

CREATE POLICY "Students can view questions from public or enrolled centers"
ON tc_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tc_question_sets qs
    JOIN tc_question_set_items qsi ON qsi.question_set_id = qs.id
    WHERE qsi.question_id = tc_questions.id
    AND qs.is_active = TRUE
    AND (
      qs.visibility = 'public' OR
      EXISTS (
        SELECT 1 FROM tc_enrollments e 
        WHERE e.center_id = qs.center_id 
        AND e.student_id = auth.uid()
      )
    )
  )
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_tc_question_sets_visibility ON tc_question_sets(visibility) WHERE visibility = 'public';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
