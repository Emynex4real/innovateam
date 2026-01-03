-- Add Basic Audit Trail

CREATE TABLE IF NOT EXISTS practice_session_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_session ON practice_session_audit(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON practice_session_audit(created_at DESC);

-- Auto-log inserts
CREATE OR REPLACE FUNCTION audit_practice_session()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO practice_session_audit (session_id, action, new_values, changed_by)
    VALUES (
      NEW.id, 'INSERT',
      jsonb_build_object(
        'is_first_attempt', NEW.is_first_attempt,
        'points_awarded', NEW.points_awarded,
        'percentage', NEW.percentage
      ),
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_audit_practice_session ON practice_sessions;
CREATE TRIGGER trigger_audit_practice_session
  AFTER INSERT ON practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION audit_practice_session();

SELECT 'Audit trail added!' as status;
