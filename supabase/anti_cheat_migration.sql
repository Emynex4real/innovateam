-- Anti-Cheat System Migration
-- Run this AFTER the initial practice_leaderboard.sql setup

-- Step 1: Add new columns if they don't exist
ALTER TABLE practice_sessions 
ADD COLUMN IF NOT EXISTS is_first_attempt BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS points_awarded INTEGER DEFAULT 0;

-- Step 2: Add index for performance
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_bank 
ON practice_sessions(user_id, bank_id);

-- Step 3: Mark first attempts (for existing data)
-- This identifies the earliest session for each user-bank combination
UPDATE practice_sessions ps1
SET is_first_attempt = (
  ps1.id = (
    SELECT ps2.id
    FROM practice_sessions ps2
    WHERE ps2.user_id = ps1.user_id 
    AND ps2.bank_id = ps1.bank_id
    ORDER BY ps2.completed_at ASC
    LIMIT 1
  )
);

-- Step 4: Calculate points for all sessions
UPDATE practice_sessions
SET points_awarded = CASE 
  WHEN is_first_attempt THEN 
    (correct_answers * 10) + 50 + (percentage * 2)
  ELSE 0
END;

-- Step 5: Recreate leaderboard views with new logic
DROP VIEW IF EXISTS leaderboard_stats CASCADE;
DROP VIEW IF EXISTS leaderboard_weekly CASCADE;
DROP VIEW IF EXISTS leaderboard_monthly CASCADE;

-- All-time leaderboard (ONLY first attempts count)
CREATE VIEW leaderboard_stats AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  COUNT(ps.id) as total_sessions,
  COUNT(DISTINCT ps.bank_id) as unique_exams_attempted,
  COALESCE(SUM(ps.total_questions), 0) as total_questions,
  COALESCE(SUM(ps.correct_answers), 0) as correct_answers,
  COALESCE(AVG(ps.percentage), 0)::INTEGER as average_score,
  COALESCE(SUM(ps.time_spent), 0) as total_time_spent,
  COALESCE(SUM(ps.points_awarded), 0)::INTEGER as points,
  (COALESCE(SUM(ps.total_questions), 0) / 50 + 1)::INTEGER as level,
  MAX(ps.completed_at) as last_practice_date
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN practice_sessions ps ON u.id = ps.user_id
GROUP BY u.id, up.full_name, u.email;

-- Weekly leaderboard (ONLY first attempts count)
CREATE VIEW leaderboard_weekly AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  COUNT(ps.id) as total_sessions,
  COUNT(DISTINCT ps.bank_id) as unique_exams_attempted,
  COALESCE(SUM(ps.total_questions), 0) as total_questions,
  COALESCE(SUM(ps.correct_answers), 0) as correct_answers,
  COALESCE(AVG(ps.percentage), 0)::INTEGER as average_score,
  COALESCE(SUM(ps.points_awarded), 0)::INTEGER as points
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN practice_sessions ps ON u.id = ps.user_id 
  AND ps.completed_at >= NOW() - INTERVAL '7 days'
GROUP BY u.id, up.full_name, u.email;

-- Monthly leaderboard (ONLY first attempts count)
CREATE VIEW leaderboard_monthly AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  COUNT(ps.id) as total_sessions,
  COUNT(DISTINCT ps.bank_id) as unique_exams_attempted,
  COALESCE(SUM(ps.total_questions), 0) as total_questions,
  COALESCE(SUM(ps.correct_answers), 0) as correct_answers,
  COALESCE(AVG(ps.percentage), 0)::INTEGER as average_score,
  COALESCE(SUM(ps.points_awarded), 0)::INTEGER as points
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN practice_sessions ps ON u.id = ps.user_id 
  AND ps.completed_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, up.full_name, u.email;

-- Step 6: Verify the migration
SELECT 
  'Migration Complete!' as status,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE is_first_attempt) as first_attempts,
  COUNT(*) FILTER (WHERE NOT is_first_attempt) as retakes,
  SUM(points_awarded) as total_points_awarded
FROM practice_sessions;
