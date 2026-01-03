-- Fix Duplicate First Attempts
-- This script corrects the is_first_attempt flag for all sessions
-- Only the EARLIEST session for each user-bank combination should be marked as first attempt

-- Step 1: Reset all to false
UPDATE practice_sessions
SET is_first_attempt = false;

-- Step 2: Mark only the earliest session as first attempt
WITH first_attempts AS (
  SELECT DISTINCT ON (user_id, bank_id)
    id
  FROM practice_sessions
  ORDER BY user_id, bank_id, completed_at ASC
)
UPDATE practice_sessions
SET is_first_attempt = true
WHERE id IN (SELECT id FROM first_attempts);

-- Step 3: Recalculate points (retakes should have 0 points)
UPDATE practice_sessions
SET points_awarded = CASE 
  WHEN is_first_attempt THEN 
    (correct_answers * 10) + 50 + (percentage * 2)
  ELSE 0
END;

-- Step 4: Verify the fix
SELECT 
  'Fix Applied!' as status,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE is_first_attempt) as first_attempts,
  COUNT(*) FILTER (WHERE NOT is_first_attempt) as retakes,
  SUM(points_awarded) as total_points_awarded,
  SUM(points_awarded) FILTER (WHERE NOT is_first_attempt) as points_from_retakes
FROM practice_sessions;

-- Step 5: Check for remaining duplicates
SELECT 
  user_id,
  bank_id,
  COUNT(*) as first_attempt_count
FROM practice_sessions
WHERE is_first_attempt = true
GROUP BY user_id, bank_id
HAVING COUNT(*) > 1;

-- If the above query returns no rows, the fix was successful!
