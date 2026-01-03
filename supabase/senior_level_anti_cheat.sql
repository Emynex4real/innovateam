-- ============================================
-- SENIOR-LEVEL ANTI-CHEAT SYSTEM
-- ============================================
-- Features:
-- 1. Database constraints (prevent duplicates at DB level)
-- 2. Atomic operations (no race conditions)
-- 3. Audit trail (track all changes)
-- 4. Centralized points calculation (DRY)
-- 5. Suspicious activity detection
-- 6. Rollback safety (transactions)
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Add Database Constraints
-- ============================================

-- Prevent multiple first attempts at database level
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_first_attempt 
ON practice_sessions (user_id, bank_id) 
WHERE is_first_attempt = true;

-- Add check constraint for valid percentages
ALTER TABLE practice_sessions
ADD CONSTRAINT check_valid_percentage 
CHECK (percentage >= 0 AND percentage <= 100);

-- Add check constraint for valid time
ALTER TABLE practice_sessions
ADD CONSTRAINT check_valid_time 
CHECK (time_spent >= 0);

-- ============================================
-- STEP 2: Create Audit Trail
-- ============================================

CREATE TABLE IF NOT EXISTS practice_session_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'POINTS_AWARDED', 'FLAGGED'
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_session ON practice_session_audit(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON practice_session_audit(created_at DESC);

-- ============================================
-- STEP 3: Centralized Points Calculation
-- ============================================

CREATE OR REPLACE FUNCTION calculate_session_points(
  p_correct_answers INTEGER,
  p_total_questions INTEGER,
  p_percentage INTEGER,
  p_difficulty TEXT DEFAULT 'medium'
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  base_points INTEGER;
  bonus_points INTEGER;
  difficulty_multiplier NUMERIC;
BEGIN
  -- Base points per correct answer
  base_points := p_correct_answers * 10;
  
  -- Completion bonus
  bonus_points := 50;
  
  -- Difficulty multiplier
  difficulty_multiplier := CASE p_difficulty
    WHEN 'easy' THEN 1.0
    WHEN 'medium' THEN 1.5
    WHEN 'hard' THEN 2.0
    ELSE 1.0
  END;
  
  -- Performance bonus
  bonus_points := bonus_points + (p_percentage * 2);
  
  RETURN FLOOR((base_points + bonus_points) * difficulty_multiplier);
END;
$$;

-- ============================================
-- STEP 4: Suspicious Activity Detection
-- ============================================

CREATE TABLE IF NOT EXISTS suspicious_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL, -- 'RAPID_COMPLETION', 'PERFECT_SCORE_FAST', 'TAB_SWITCH', 'COPY_PASTE'
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  details JSONB,
  reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suspicious_user ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_unreviewed ON suspicious_activities(reviewed) WHERE reviewed = false;

-- Function to detect suspicious patterns
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_time_per_question NUMERIC;
  is_suspicious BOOLEAN := false;
  flag_details JSONB := '{}';
BEGIN
  avg_time_per_question := NEW.time_spent::NUMERIC / NULLIF(NEW.total_questions, 0);
  
  -- Flag 1: Too fast with high score (< 5 seconds per question with > 80%)
  IF avg_time_per_question < 5 AND NEW.percentage > 80 THEN
    INSERT INTO suspicious_activities (user_id, session_id, flag_type, severity, details)
    VALUES (
      NEW.user_id,
      NEW.id,
      'RAPID_COMPLETION',
      'HIGH',
      jsonb_build_object(
        'avg_time_per_question', avg_time_per_question,
        'percentage', NEW.percentage,
        'total_questions', NEW.total_questions
      )
    );
  END IF;
  
  -- Flag 2: Perfect score too fast (< 10 seconds per question with 100%)
  IF avg_time_per_question < 10 AND NEW.percentage = 100 THEN
    INSERT INTO suspicious_activities (user_id, session_id, flag_type, severity, details)
    VALUES (
      NEW.user_id,
      NEW.id,
      'PERFECT_SCORE_FAST',
      'CRITICAL',
      jsonb_build_object(
        'avg_time_per_question', avg_time_per_question,
        'percentage', NEW.percentage
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-detect suspicious activity
DROP TRIGGER IF EXISTS trigger_detect_suspicious ON practice_sessions;
CREATE TRIGGER trigger_detect_suspicious
  AFTER INSERT ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION detect_suspicious_activity();

-- ============================================
-- STEP 5: Atomic First Attempt Check
-- ============================================

CREATE OR REPLACE FUNCTION save_practice_session(
  p_user_id UUID,
  p_bank_id UUID,
  p_bank_name TEXT,
  p_subject TEXT,
  p_total_questions INTEGER,
  p_correct_answers INTEGER,
  p_time_spent INTEGER,
  p_percentage INTEGER,
  p_difficulty TEXT DEFAULT 'medium'
)
RETURNS TABLE (
  session_id UUID,
  is_first_attempt BOOLEAN,
  points_awarded INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_first_attempt BOOLEAN;
  v_points_awarded INTEGER;
  v_session_id UUID;
BEGIN
  -- Atomic check: Is this the first attempt?
  SELECT NOT EXISTS (
    SELECT 1 FROM practice_sessions
    WHERE user_id = p_user_id AND bank_id = p_bank_id
  ) INTO v_is_first_attempt;
  
  -- Calculate points only for first attempt
  IF v_is_first_attempt THEN
    v_points_awarded := calculate_session_points(
      p_correct_answers,
      p_total_questions,
      p_percentage,
      p_difficulty
    );
  ELSE
    v_points_awarded := 0;
  END IF;
  
  -- Insert session (will fail if duplicate first attempt due to unique index)
  INSERT INTO practice_sessions (
    user_id,
    bank_id,
    bank_name,
    subject,
    total_questions,
    correct_answers,
    time_spent,
    percentage,
    is_first_attempt,
    points_awarded
  ) VALUES (
    p_user_id,
    p_bank_id,
    p_bank_name,
    p_subject,
    p_total_questions,
    p_correct_answers,
    p_time_spent,
    p_percentage,
    v_is_first_attempt,
    v_points_awarded
  )
  RETURNING id INTO v_session_id;
  
  -- Audit trail
  INSERT INTO practice_session_audit (
    session_id,
    action,
    new_values,
    changed_by
  ) VALUES (
    v_session_id,
    'INSERT',
    jsonb_build_object(
      'is_first_attempt', v_is_first_attempt,
      'points_awarded', v_points_awarded,
      'percentage', p_percentage
    ),
    p_user_id
  );
  
  -- Return results
  RETURN QUERY SELECT v_session_id, v_is_first_attempt, v_points_awarded;
END;
$$;

-- ============================================
-- STEP 6: Rate Limiting
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'PRACTICE_START', 'PRACTICE_SUBMIT'
  window_start TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action, window_start);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_attempt_count INTEGER;
BEGIN
  -- Calculate window start (round down to nearest window)
  v_window_start := date_trunc('minute', NOW()) - 
    (EXTRACT(MINUTE FROM NOW())::INTEGER % p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get or create rate limit record
  INSERT INTO rate_limits (user_id, action, window_start, attempt_count)
  VALUES (p_user_id, p_action, v_window_start, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET attempt_count = rate_limits.attempt_count + 1
  RETURNING attempt_count INTO v_attempt_count;
  
  -- Check if limit exceeded
  RETURN v_attempt_count <= p_max_attempts;
END;
$$;

-- ============================================
-- STEP 7: Admin Views
-- ============================================

-- View: Suspicious users
CREATE OR REPLACE VIEW suspicious_users_summary AS
SELECT 
  u.id as user_id,
  COALESCE(up.full_name, u.email) as name,
  COUNT(sa.id) as total_flags,
  COUNT(sa.id) FILTER (WHERE sa.severity = 'CRITICAL') as critical_flags,
  COUNT(sa.id) FILTER (WHERE sa.severity = 'HIGH') as high_flags,
  COUNT(sa.id) FILTER (WHERE NOT sa.reviewed) as unreviewed_flags,
  MAX(sa.created_at) as last_flagged_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN suspicious_activities sa ON u.id = sa.user_id
GROUP BY u.id, up.full_name, u.email
HAVING COUNT(sa.id) > 0
ORDER BY critical_flags DESC, high_flags DESC, total_flags DESC;

-- ============================================
-- STEP 8: Fix Existing Data
-- ============================================

-- Reset all first attempts
UPDATE practice_sessions SET is_first_attempt = false;

-- Mark only earliest as first attempt
WITH first_attempts AS (
  SELECT DISTINCT ON (user_id, bank_id) id
  FROM practice_sessions
  ORDER BY user_id, bank_id, completed_at ASC
)
UPDATE practice_sessions
SET is_first_attempt = true
WHERE id IN (SELECT id FROM first_attempts);

-- Recalculate all points using new function
UPDATE practice_sessions
SET points_awarded = CASE 
  WHEN is_first_attempt THEN 
    calculate_session_points(correct_answers, total_questions, percentage, 'medium')
  ELSE 0
END;

-- ============================================
-- STEP 9: Verify & Commit
-- ============================================

DO $$
DECLARE
  v_total INTEGER;
  v_first INTEGER;
  v_duplicates INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total FROM practice_sessions;
  SELECT COUNT(*) INTO v_first FROM practice_sessions WHERE is_first_attempt;
  
  SELECT COUNT(*) INTO v_duplicates FROM (
    SELECT user_id, bank_id, COUNT(*) as cnt
    FROM practice_sessions
    WHERE is_first_attempt = true
    GROUP BY user_id, bank_id
    HAVING COUNT(*) > 1
  ) sub;
  
  IF v_duplicates > 0 THEN
    RAISE EXCEPTION 'Migration failed: % duplicate first attempts found', v_duplicates;
  END IF;
  
  RAISE NOTICE 'Migration successful: % total sessions, % first attempts, 0 duplicates', v_total, v_first;
END $$;

COMMIT;

-- ============================================
-- FINAL VERIFICATION
-- ============================================

SELECT 
  'Senior-Level Migration Complete!' as status,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE is_first_attempt) as first_attempts,
  COUNT(*) FILTER (WHERE NOT is_first_attempt) as retakes,
  SUM(points_awarded) as total_points,
  SUM(points_awarded) FILTER (WHERE NOT is_first_attempt) as points_from_retakes
FROM practice_sessions;
