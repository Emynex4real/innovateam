-- CRITICAL: Add Rate Limiting
-- Prevents spam and abuse

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON rate_limits(user_id, action, window_start);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_attempts INTEGER DEFAULT 20,
  p_window_minutes INTEGER DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_attempt_count INTEGER;
BEGIN
  v_window_start := date_trunc('minute', NOW()) - 
    (EXTRACT(MINUTE FROM NOW())::INTEGER % p_window_minutes || ' minutes')::INTERVAL;
  
  INSERT INTO rate_limits (user_id, action, window_start, attempt_count)
  VALUES (p_user_id, p_action, v_window_start, 1)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET attempt_count = rate_limits.attempt_count + 1
  RETURNING attempt_count INTO v_attempt_count;
  
  RETURN v_attempt_count <= p_max_attempts;
END;
$$;

SELECT 'Rate limiting added!' as status;
