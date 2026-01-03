-- Add Suspicious Activity Detection

CREATE TABLE IF NOT EXISTS suspicious_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  details JSONB,
  reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suspicious_user ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_unreviewed ON suspicious_activities(reviewed) WHERE reviewed = false;

-- Auto-detect suspicious patterns
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  avg_time_per_question NUMERIC;
BEGIN
  avg_time_per_question := NEW.time_spent::NUMERIC / NULLIF(NEW.total_questions, 0);
  
  -- Flag: Too fast with high score
  IF avg_time_per_question < 5 AND NEW.percentage > 80 THEN
    INSERT INTO suspicious_activities (user_id, session_id, flag_type, severity, details)
    VALUES (
      NEW.user_id, NEW.id, 'RAPID_COMPLETION', 'HIGH',
      jsonb_build_object('avg_time', avg_time_per_question, 'percentage', NEW.percentage)
    );
  END IF;
  
  -- Flag: Perfect score too fast
  IF avg_time_per_question < 10 AND NEW.percentage = 100 THEN
    INSERT INTO suspicious_activities (user_id, session_id, flag_type, severity, details)
    VALUES (
      NEW.user_id, NEW.id, 'PERFECT_SCORE_FAST', 'CRITICAL',
      jsonb_build_object('avg_time', avg_time_per_question)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_detect_suspicious ON practice_sessions;
CREATE TRIGGER trigger_detect_suspicious
  AFTER INSERT ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION detect_suspicious_activity();

SELECT 'Suspicious activity detection added!' as status;
