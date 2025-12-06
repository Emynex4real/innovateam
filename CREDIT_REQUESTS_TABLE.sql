-- Run this in Supabase SQL Editor to create credit_requests table

CREATE TABLE IF NOT EXISTS credit_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) DEFAULT 5000.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT,
  is_beta_test BOOLEAN DEFAULT true, -- Mark as beta test request
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT one_request_per_user UNIQUE(user_id) -- Only one request per user
);

-- Create index for faster queries
CREATE INDEX idx_credit_requests_user_id ON credit_requests(user_id);
CREATE INDEX idx_credit_requests_status ON credit_requests(status);

-- Enable Row Level Security
ALTER TABLE credit_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own requests" ON credit_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can create their own requests
CREATE POLICY "Users can create own requests" ON credit_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all requests
CREATE POLICY "Admins can view all requests" ON credit_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all requests
CREATE POLICY "Admins can update all requests" ON credit_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
