-- Drop and recreate functions with tutor_id parameter

DROP FUNCTION IF EXISTS public.add_questions_to_test(UUID, UUID[]);
DROP FUNCTION IF EXISTS public.remove_question_from_test(UUID, UUID);

-- Function to add questions to test
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
    question_ids[i],
    COALESCE((SELECT MAX(order_index) FROM tc_question_set_questions WHERE question_set_id = test_id), -1) + i
  FROM generate_series(1, array_length(question_ids, 1)) AS i
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

GRANT EXECUTE ON FUNCTION public.add_questions_to_test TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_question_from_test TO authenticated;
