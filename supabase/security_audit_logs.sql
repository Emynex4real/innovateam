-- Security Audit Logs Table
-- Stores all security-relevant events for compliance and monitoring

CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  success BOOLEAN DEFAULT true,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON security_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON security_audit_logs(ip_address);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp 
ON security_audit_logs(user_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
ON security_audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.is_admin = true
  )
);

-- Policy: System can insert audit logs (service role)
CREATE POLICY "System can insert audit logs"
ON security_audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Function to clean old audit logs (retention policy)
CREATE OR REPLACE FUNCTION clean_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_audit_logs
  WHERE timestamp < NOW() - INTERVAL '90 days'
  AND severity IN ('low', 'medium');
  
  -- Keep high and critical logs for 1 year
  DELETE FROM security_audit_logs
  WHERE timestamp < NOW() - INTERVAL '365 days'
  AND severity IN ('high', 'critical');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run daily)
-- Note: You'll need to set up pg_cron or external scheduler
-- SELECT cron.schedule('clean-audit-logs', '0 2 * * *', 'SELECT clean_old_audit_logs()');

COMMENT ON TABLE security_audit_logs IS 'Security audit trail for compliance and monitoring';
COMMENT ON COLUMN security_audit_logs.event_type IS 'Type of security event (login, logout, etc.)';
COMMENT ON COLUMN security_audit_logs.severity IS 'Event severity level';
COMMENT ON COLUMN security_audit_logs.details IS 'Additional event details in JSON format';
