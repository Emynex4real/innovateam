-- Fixed Security Monitoring Tables

-- First add 'security' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'security';

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_security_incidents_type_severity ON public.security_incidents(incident_type, severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_user_id ON public.security_incidents(user_id);

-- RLS Policies
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view security incidents (simplified)
CREATE POLICY "Admins can manage incidents" ON public.security_incidents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage alerts" ON public.security_alerts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Simple security score function
CREATE OR REPLACE FUNCTION public.calculate_security_score(
  user_uuid UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 100;
  incident_count INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO incident_count
  FROM public.security_incidents
  WHERE (user_uuid IS NULL OR user_id = user_uuid)
    AND created_at > NOW() - INTERVAL '30 days'
    AND severity >= 3;
  
  RETURN GREATEST(0, base_score - (incident_count * 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;