-- Industry-standard many-to-many relationship for questions and question sets
-- This allows:
-- 1. One question to be in multiple tests
-- 2. One test to have multiple questions
-- 3. Custom ordering of questions per test
-- 4. Different point values per question per test

-- Create junction table
CREATE TABLE IF NOT EXISTS public.tc_question_set_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_set_id UUID NOT NULL REFERENCES public.tc_question_sets(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.tc_questions(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  points INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no duplicate questions in same test
  UNIQUE(question_set_id, question_id),
  -- Ensure unique ordering within a test
  UNIQUE(question_set_id, order_index)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tc_qsq_question_set ON public.tc_question_set_questions(question_set_id);
CREATE INDEX IF NOT EXISTS idx_tc_qsq_question ON public.tc_question_set_questions(question_id);
CREATE INDEX IF NOT EXISTS idx_tc_qsq_order ON public.tc_question_set_questions(question_set_id, order_index);

-- Enable RLS
ALTER TABLE public.tc_question_set_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "tutors_manage_own_test_questions" ON public.tc_question_set_questions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tc_question_sets qs
      WHERE qs.id = question_set_id
      AND qs.tutor_id = auth.uid()
    )
  );

CREATE POLICY "students_view_test_questions" ON public.tc_question_set_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tc_question_sets qs
      WHERE qs.id = question_set_id
      AND (qs.visibility = 'public' OR EXISTS (
        SELECT 1 FROM tc_enrollments e
        WHERE e.center_id = qs.center_id
        AND e.student_id = auth.uid()
      ))
    )
  );

-- Function to add questions to test (with transaction safety)
CREATE OR REPLACE FUNCTION public.add_questions_to_test(
  test_id UUID,
  question_ids UUID[],
  tutor_user_id UUID
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  added_count INTEGER := 0;
  result JSON;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM tc_question_sets
    WHERE id = test_id AND tutor_id = tutor_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized or test not found';
  END IF;
  
  -- Add questions with auto-incrementing order
  INSERT INTO tc_question_set_questions (question_set_id, question_id, order_index)
  SELECT 
    test_id,
    unnest(question_ids),
    ROW_NUMBER() OVER () - 1 + COALESCE((
      SELECT MAX(order_index) + 1 
      FROM tc_question_set_questions 
      WHERE question_set_id = test_id
    ), 0)
  ON CONFLICT (question_set_id, question_id) DO NOTHING;
  
  GET DIAGNOSTICS added_count = ROW_COUNT;
  
  result := json_build_object(
    'success', true,
    'added', added_count,
    'message', format('Added %s questions to test', added_count)
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_questions_to_test TO authenticated;

-- Function to remove question from test
CREATE OR REPLACE FUNCTION public.remove_question_from_test(
  test_id UUID,
  question_id_param UUID,
  tutor_user_id UUID
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM tc_question_sets
    WHERE id = test_id AND tutor_id = tutor_user_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized or test not found';
  END IF;
  
  -- Remove question
  DELETE FROM tc_question_set_questions
  WHERE question_set_id = test_id AND question_id = question_id_param;
  
  -- Reorder remaining questions
  UPDATE tc_question_set_questions
  SET order_index = subquery.new_order
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY order_index) - 1 AS new_order
    FROM tc_question_set_questions
    WHERE question_set_id = test_id
  ) AS subquery
  WHERE tc_question_set_questions.id = subquery.id;
  
  result := json_build_object(
    'success', true,
    'message', 'Question removed from test'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_question_from_test TO authenticated;

-- Verify tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'tc_question_set_questions';
