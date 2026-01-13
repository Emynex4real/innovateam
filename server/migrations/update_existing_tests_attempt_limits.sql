-- Update existing tests to use new default attempt limits
-- Run this in Supabase SQL Editor AFTER running add_attempt_limits.sql

-- Update all existing tests to have 1 attempt and 0 cooldown
-- (You can modify this query to only update specific tests if needed)
UPDATE tc_question_sets 
SET 
  max_attempts = 1,
  cooldown_hours = 0
WHERE max_attempts = 3 AND cooldown_hours = 24;

-- Verify the update
SELECT id, title, max_attempts, cooldown_hours 
FROM tc_question_sets 
ORDER BY created_at DESC 
LIMIT 10;
