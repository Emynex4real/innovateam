-- Create subscription grace periods table
CREATE TABLE IF NOT EXISTS subscription_grace_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('students', 'questions', 'tests')),
  limit_exceeded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grace_ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, resource_type)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_grace_periods_tutor_resource ON subscription_grace_periods(tutor_id, resource_type);

-- Enable RLS
ALTER TABLE subscription_grace_periods ENABLE ROW LEVEL SECURITY;

-- Policy: Tutors can view their own grace periods
CREATE POLICY "Tutors can view own grace periods"
  ON subscription_grace_periods
  FOR SELECT
  USING (auth.uid() = tutor_id);

-- Policy: System can manage grace periods (service role)
CREATE POLICY "Service role can manage grace periods"
  ON subscription_grace_periods
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
