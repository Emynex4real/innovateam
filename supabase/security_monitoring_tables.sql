-- Security Monitoring Tables
-- Run this after the main database.sql and compliance_tables.sql

-- Security incidents table
CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id TEXT UNIQUE NOT NULL,
  incident_type TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 4),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
  details JSONB NOT NULL DEFAULT '{}',
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  url TEXT,
  ip_address INET,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security alerts table
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.security_incidents(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  message TEXT NOT NULL,
  recipients TEXT[] DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Security metrics table for dashboard
CREATE TABLE IF NOT EXISTS public.security_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_data JSONB DEFAULT '{}',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  time_bucket TIMESTAMPTZ NOT NULL -- For time-series aggregation
);

-- Threat intelligence table
CREATE TABLE IF NOT EXISTS public.threat_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('ip', 'domain', 'hash', 'pattern')),
  indicator_value TEXT NOT NULL,
  threat_level TEXT NOT NULL CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  source TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_incidents_type_severity ON public.security_incidents(incident_type, severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status_created ON public.security_incidents(status, created_at);
CREATE INDEX IF NOT EXISTS idx_security_incidents_user_id ON public.security_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity_sent ON public.security_alerts(severity, sent_at);
CREATE INDEX IF NOT EXISTS idx_security_metrics_type_bucket ON public.security_metrics(metric_type, time_bucket);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_type_active ON public.threat_indicators(indicator_type, is_active);

-- RLS Policies
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_indicators ENABLE ROW LEVEL SECURITY;

-- Only admins and security team can view security incidents
CREATE POLICY "Security team can view incidents" ON public.security_incidents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'security'))
  );

-- Only security team can create incidents
CREATE POLICY "Security team can create incidents" ON public.security_incidents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'security'))
  );

-- Only security team can update incidents
CREATE POLICY "Security team can update incidents" ON public.security_incidents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'security'))
  );

-- Similar policies for other tables
CREATE POLICY "Security team can manage alerts" ON public.security_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'security'))
  );

CREATE POLICY "Security team can view metrics" ON public.security_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'security'))
  );

CREATE POLICY "Security team can manage threats" ON public.threat_indicators
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'security'))
  );

-- Function to auto-update incident timestamps
CREATE OR REPLACE FUNCTION public.update_incident_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for incident updates
CREATE TRIGGER update_security_incident_timestamp
  BEFORE UPDATE ON public.security_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_incident_timestamp();

-- Function to calculate security score
CREATE OR REPLACE FUNCTION public.calculate_security_score(
  user_uuid UUID DEFAULT NULL,
  time_period INTERVAL DEFAULT INTERVAL '30 days'
) RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 100;
  incident_penalty INTEGER := 0;
  failed_login_penalty INTEGER := 0;
  large_transaction_penalty INTEGER := 0;
BEGIN
  -- Deduct points for security incidents
  SELECT COUNT(*) * 10 INTO incident_penalty
  FROM public.security_incidents
  WHERE (user_uuid IS NULL OR user_id = user_uuid)
    AND created_at > NOW() - time_period
    AND severity >= 3;
  
  -- Deduct points for failed logins
  SELECT COUNT(*) * 2 INTO failed_login_penalty
  FROM public.activity_logs
  WHERE (user_uuid IS NULL OR user_id = user_uuid)
    AND action = 'login_failed'
    AND created_at > NOW() - time_period;
  
  -- Deduct points for large transactions without proper verification
  SELECT COUNT(*) * 5 INTO large_transaction_penalty
  FROM public.transactions t
  WHERE (user_uuid IS NULL OR t.user_id = user_uuid)
    AND t.amount > 50000
    AND t.created_at > NOW() - time_period
    AND NOT EXISTS (
      SELECT 1 FROM public.activity_logs al
      WHERE al.user_id = t.user_id
        AND al.action = 'additional_verification_completed'
        AND al.created_at BETWEEN t.created_at - INTERVAL '1 hour' AND t.created_at + INTERVAL '1 hour'
    );
  
  RETURN GREATEST(0, base_score - incident_penalty - failed_login_penalty - large_transaction_penalty);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get security dashboard data
CREATE OR REPLACE FUNCTION public.get_security_dashboard(
  time_period INTERVAL DEFAULT INTERVAL '24 hours'
) RETURNS TABLE(
  total_incidents BIGINT,
  critical_incidents BIGINT,
  open_incidents BIGINT,
  security_score INTEGER,
  top_threats JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.security_incidents WHERE created_at > NOW() - time_period),
    (SELECT COUNT(*) FROM public.security_incidents WHERE created_at > NOW() - time_period AND severity = 4),
    (SELECT COUNT(*) FROM public.security_incidents WHERE status = 'open'),
    public.calculate_security_score(NULL, time_period),
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'type', incident_type,
        'count', incident_count
      ) ORDER BY incident_count DESC
    ), '[]'::jsonb)
    FROM (
      SELECT incident_type, COUNT(*) as incident_count
      FROM public.security_incidents
      WHERE created_at > NOW() - time_period
      GROUP BY incident_type
      LIMIT 5
    ) top_incidents);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;