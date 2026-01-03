-- API Usage Logs & Cost Tracking
-- Run this in your Supabase SQL Editor

-- Create API usage logs table
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID,
  service TEXT NOT NULL, -- 'gemini', 'deepseek', etc.
  operation TEXT NOT NULL, -- 'generateQuestions', 'parseBulkQuestions', etc.
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  status TEXT NOT NULL, -- 'success', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_service ON public.api_usage_logs(service);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_status ON public.api_usage_logs(status);

-- Enable Row Level Security
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Admins can view all usage logs" ON public.api_usage_logs;
DROP POLICY IF EXISTS "Users can view own usage logs" ON public.api_usage_logs;
DROP POLICY IF EXISTS "Service can insert usage logs" ON public.api_usage_logs;

CREATE POLICY "Admins can view all usage logs" ON public.api_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can view own usage logs" ON public.api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert usage logs" ON public.api_usage_logs
  FOR INSERT WITH CHECK (true);

-- Create cost analysis view
CREATE OR REPLACE VIEW public.api_cost_analysis AS
SELECT 
  DATE(created_at) as date,
  service,
  operation,
  COUNT(*) as total_requests,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_requests,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_requests,
  ROUND(AVG(input_tokens), 2) as avg_input_tokens,
  ROUND(AVG(output_tokens), 2) as avg_output_tokens,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  -- Gemini 1.5 Flash pricing (as of 2025): $0.075 per 1M input tokens, $0.30 per 1M output tokens
  ROUND((SUM(input_tokens) * 0.075 / 1000000.0) + (SUM(output_tokens) * 0.30 / 1000000.0), 4) as estimated_cost_usd
FROM public.api_usage_logs
WHERE service = 'gemini'
GROUP BY DATE(created_at), service, operation
ORDER BY date DESC, total_requests DESC;

-- Create user cost summary view
CREATE OR REPLACE VIEW public.user_api_costs AS
SELECT 
  user_id,
  service,
  COUNT(*) as total_requests,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  ROUND((SUM(input_tokens) * 0.075 / 1000000.0) + (SUM(output_tokens) * 0.30 / 1000000.0), 4) as estimated_cost_usd,
  MIN(created_at) as first_request,
  MAX(created_at) as last_request
FROM public.api_usage_logs
WHERE service = 'gemini' AND user_id IS NOT NULL
GROUP BY user_id, service
ORDER BY estimated_cost_usd DESC;

-- Grant permissions
GRANT SELECT ON public.api_cost_analysis TO authenticated;
GRANT SELECT ON public.user_api_costs TO authenticated;

-- Verify table creation
SELECT 'api_usage_logs table created' as status 
FROM information_schema.tables 
WHERE table_name = 'api_usage_logs';

COMMENT ON TABLE public.api_usage_logs IS 'Tracks all AI API usage for cost monitoring and auditing';
COMMENT ON VIEW public.api_cost_analysis IS 'Daily cost analysis for Gemini API usage';
COMMENT ON VIEW public.user_api_costs IS 'Per-user cost summary for Gemini API usage';
