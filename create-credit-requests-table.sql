-- OPTIONAL: Create credit_requests table
-- Only run this if you want users to request wallet credits

CREATE TABLE IF NOT EXISTS public.credit_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "users_view_own_requests" ON public.credit_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_create_own_requests" ON public.credit_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins_view_all_requests" ON public.credit_requests
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "admins_update_requests" ON public.credit_requests
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Index
CREATE INDEX idx_credit_requests_user_id ON public.credit_requests(user_id);
CREATE INDEX idx_credit_requests_status ON public.credit_requests(status);
