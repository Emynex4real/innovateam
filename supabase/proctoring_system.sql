-- ============================================
-- ANTI-CHEAT / PROCTORING SYSTEM
-- Browser-only tracking for tutorial centers
-- ============================================

-- 1. Proctoring Sessions Table
CREATE TABLE IF NOT EXISTS proctoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES tc_student_attempts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES tc_question_sets(id) ON DELETE CASCADE,
  device_fingerprint JSONB DEFAULT '{}',
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(20) DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  total_violations INTEGER DEFAULT 0,
  flags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Proctoring Violations Table
CREATE TABLE IF NOT EXISTS proctoring_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES proctoring_sessions(id) ON DELETE CASCADE,
  violation_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  severity INTEGER DEFAULT 1 CHECK (severity >= 1 AND severity <= 5)
);

-- 3. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_attempt ON proctoring_sessions(attempt_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_student ON proctoring_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_test ON proctoring_sessions(test_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_sessions_risk ON proctoring_sessions(risk_level);
CREATE INDEX IF NOT EXISTS idx_proctoring_violations_session ON proctoring_violations(session_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_violations_type ON proctoring_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_proctoring_violations_timestamp ON proctoring_violations(timestamp DESC);

-- 4. RLS Policies
ALTER TABLE proctoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_violations ENABLE ROW LEVEL SECURITY;

-- Students can view their own sessions
CREATE POLICY "Students view own proctoring sessions"
  ON proctoring_sessions FOR SELECT
  USING (auth.uid() = student_id);

-- Tutors can view sessions for their center's tests
CREATE POLICY "Tutors view center proctoring sessions"
  ON proctoring_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tc_question_sets qs
      WHERE qs.id = proctoring_sessions.test_id
      AND qs.center_id IN (
        SELECT center_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Students can view their own violations
CREATE POLICY "Students view own violations"
  ON proctoring_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proctoring_sessions ps
      WHERE ps.id = proctoring_violations.session_id
      AND ps.student_id = auth.uid()
    )
  );

-- Tutors can view violations for their center
CREATE POLICY "Tutors view center violations"
  ON proctoring_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proctoring_sessions ps
      JOIN tc_question_sets qs ON qs.id = ps.test_id
      WHERE ps.id = proctoring_violations.session_id
      AND qs.center_id IN (
        SELECT center_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- 5. Function to Calculate Risk Score
CREATE OR REPLACE FUNCTION calculate_risk_score(session_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  tab_switches INTEGER;
  copy_attempts INTEGER;
  focus_loss INTEGER;
  total_time_away INTEGER;
  score INTEGER := 0;
BEGIN
  -- Count violations by type
  SELECT 
    COUNT(*) FILTER (WHERE violation_type = 'TAB_SWITCH'),
    COUNT(*) FILTER (WHERE violation_type = 'COPY_ATTEMPT'),
    COUNT(*) FILTER (WHERE violation_type = 'FOCUS_LOSS'),
    COALESCE(SUM((metadata->>'duration')::INTEGER) FILTER (WHERE violation_type = 'FOCUS_LOSS'), 0)
  INTO tab_switches, copy_attempts, focus_loss, total_time_away
  FROM proctoring_violations
  WHERE session_id = session_uuid;

  -- Calculate score (0-100)
  score := LEAST(100, 
    (tab_switches * 15) + 
    (copy_attempts * 20) + 
    (focus_loss * 10) + 
    (total_time_away / 1000)
  );

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- 6. Function to Update Risk Level
CREATE OR REPLACE FUNCTION update_risk_level()
RETURNS TRIGGER AS $$
DECLARE
  new_score INTEGER;
  new_level VARCHAR(20);
  violation_count INTEGER;
BEGIN
  -- Calculate new risk score
  new_score := calculate_risk_score(NEW.session_id);
  
  -- Count total violations
  SELECT COUNT(*) INTO violation_count
  FROM proctoring_violations
  WHERE session_id = NEW.session_id;

  -- Determine risk level
  IF new_score >= 75 OR violation_count >= 20 THEN
    new_level := 'CRITICAL';
  ELSIF new_score >= 50 OR violation_count >= 10 THEN
    new_level := 'HIGH';
  ELSIF new_score >= 25 OR violation_count >= 5 THEN
    new_level := 'MEDIUM';
  ELSE
    new_level := 'LOW';
  END IF;

  -- Update session
  UPDATE proctoring_sessions
  SET 
    risk_score = new_score,
    risk_level = new_level,
    total_violations = violation_count
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger to Auto-Update Risk Score
DROP TRIGGER IF EXISTS trigger_update_risk_level ON proctoring_violations;
CREATE TRIGGER trigger_update_risk_level
  AFTER INSERT ON proctoring_violations
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_level();

-- 8. View for Tutor Dashboard
CREATE OR REPLACE VIEW proctoring_summary AS
SELECT 
  ps.id,
  ps.attempt_id,
  ps.student_id,
  ps.test_id,
  u.raw_user_meta_data->>'name' as student_name,
  u.email as student_email,
  qs.title as test_title,
  ps.risk_score,
  ps.risk_level,
  ps.total_violations,
  ps.session_start,
  ps.session_end,
  ps.flags,
  ta.score as test_score,
  CASE WHEN ta.score >= qs.passing_score THEN true ELSE false END as test_passed,
  -- Violation breakdown
  (SELECT COUNT(*) FROM proctoring_violations WHERE session_id = ps.id AND violation_type = 'TAB_SWITCH') as tab_switches,
  (SELECT COUNT(*) FROM proctoring_violations WHERE session_id = ps.id AND violation_type = 'COPY_ATTEMPT') as copy_attempts,
  (SELECT COUNT(*) FROM proctoring_violations WHERE session_id = ps.id AND violation_type = 'FOCUS_LOSS') as focus_losses,
  (SELECT COUNT(*) FROM proctoring_violations WHERE session_id = ps.id AND violation_type = 'RIGHT_CLICK') as right_clicks,
  (SELECT COUNT(*) FROM proctoring_violations WHERE session_id = ps.id AND violation_type = 'FULLSCREEN_EXIT') as fullscreen_exits
FROM proctoring_sessions ps
JOIN auth.users u ON u.id = ps.student_id
JOIN tc_question_sets qs ON qs.id = ps.test_id
LEFT JOIN tc_student_attempts ta ON ta.id = ps.attempt_id;

COMMENT ON TABLE proctoring_sessions IS 'Tracks exam proctoring sessions with risk scoring';
COMMENT ON TABLE proctoring_violations IS 'Logs individual suspicious activities during exams';
COMMENT ON VIEW proctoring_summary IS 'Aggregated proctoring data for tutor dashboard';
