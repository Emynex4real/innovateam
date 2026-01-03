-- Verify Tagging System is Working

-- 1. Check all questions have tags
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN tags IS NOT NULL AND array_length(tags, 1) > 0 THEN 1 END) as with_tags,
  COUNT(CASE WHEN tags IS NULL OR array_length(tags, 1) IS NULL THEN 1 END) as without_tags
FROM tc_questions;

-- 2. View tag distribution
SELECT 
  unnest(tags) as tag,
  COUNT(*) as usage_count
FROM tc_questions
WHERE tags IS NOT NULL
GROUP BY tag
ORDER BY usage_count DESC;

-- 3. Check tag usage table
SELECT * FROM tc_question_tags ORDER BY usage_count DESC LIMIT 10;

-- 4. Test filtering by tag (example: mathematics)
SELECT 
  id,
  question_text,
  subject,
  tags,
  difficulty_level
FROM tc_questions
WHERE 'mathematics' = ANY(tags);

-- 5. Test multiple tag search (AND logic)
SELECT 
  id,
  question_text,
  tags
FROM tc_questions
WHERE tags @> ARRAY['mathematics', 'medium']::TEXT[];

-- 6. Get questions by difficulty and tag
SELECT 
  id,
  LEFT(question_text, 50) as question_preview,
  difficulty_level,
  tags
FROM tc_questions
WHERE difficulty_level = 'medium'
  AND 'mathematics' = ANY(tags);

-- Expected Results:
-- ✅ All questions should have at least 1 tag
-- ✅ Tag usage table should show counts
-- ✅ Filtering queries should return results
