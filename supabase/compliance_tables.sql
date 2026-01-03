-- Compliance and Privacy Tables
-- Run this after the main database.sql

-- User consent tracking table
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('data_processing', 'marketing', 'analytics', 'cookies')),
  granted BOOLEAN NOT NULL,
  purpose TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  withdrawn_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data processing activities log
CREATE TABLE IF NOT EXISTS public.data_processing_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  processing_type TEXT NOT NULL,
  data_categories TEXT[] NOT NULL,
  legal_basis TEXT NOT NULL,
  purpose TEXT NOT NULL,
  retention_period INTERVAL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  processor_id UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Data subject requests tracking
CREATE TABLE IF NOT EXISTS public.data_subject_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  request_details JSONB,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  processed_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add compliance fields to existing users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS data_retention_date TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_consents_user_type ON public.user_consents(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_recorded_at ON public.user_consents(recorded_at);
CREATE INDEX IF NOT EXISTS idx_data_processing_log_user_id ON public.data_processing_log(user_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_user_status ON public.data_subject_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON public.users(is_deleted, deleted_at);

-- RLS Policies for compliance tables
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own consents
CREATE POLICY "Users can view own consents" ON public.user_consents
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can create their own consents
CREATE POLICY "Users can create own consents" ON public.user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can view data processing logs
CREATE POLICY "Admins can view data processing logs" ON public.data_processing_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can create data subject requests
CREATE POLICY "Users can create data subject requests" ON public.data_subject_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests, admins can view all
CREATE POLICY "Users can view own requests" ON public.data_subject_requests
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to automatically set data retention dates
CREATE OR REPLACE FUNCTION public.set_data_retention_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention date to 7 years from creation for user data
  NEW.data_retention_date = NEW.created_at + INTERVAL '7 years';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set retention date on user creation
CREATE TRIGGER set_user_retention_date
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_data_retention_date();

-- Function to check consent validity
CREATE OR REPLACE FUNCTION public.check_user_consent(
  user_uuid UUID,
  consent_type_param TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  latest_consent BOOLEAN;
BEGIN
  SELECT granted INTO latest_consent
  FROM public.user_consents
  WHERE user_id = user_uuid 
    AND consent_type = consent_type_param
    AND withdrawn_at IS NULL
  ORDER BY recorded_at DESC
  LIMIT 1;
  
  RETURN COALESCE(latest_consent, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to anonymize user data
CREATE OR REPLACE FUNCTION public.anonymize_user_data(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update user record
  UPDATE public.users 
  SET 
    email = 'deleted_' || user_uuid || '@anonymized.local',
    phone = NULL,
    is_deleted = TRUE,
    deleted_at = NOW()
  WHERE id = user_uuid;
  
  -- Anonymize transaction descriptions
  UPDATE public.transactions 
  SET description = 'ANONYMIZED'
  WHERE user_id = user_uuid;
  
  -- Log the anonymization
  INSERT INTO public.activity_logs (user_id, action, resource, metadata)
  VALUES (user_uuid, 'data_anonymized', 'user_data', '{"reason": "data_subject_request"}');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;