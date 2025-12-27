-- Verify questions in "HHH" test
SELECT 
  qsq.order_index,
  qsq.points,
  q.id as question_id,
  q.question_text,
  q.subject,
  q.difficulty,
  q.correct_answer
FROM tc_question_set_questions qsq
JOIN tc_questions q ON qsq.question_id = q.id
WHERE qsq.question_set_id = 'eb938d98-9ffc-4994-a413-2b7aa551c8a7'
ORDER BY qsq.order_index;

-- Expected: 5 rows with questions
