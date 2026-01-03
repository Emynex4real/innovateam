-- Clean up transaction policies
-- Run this in Supabase SQL Editor

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow service role full access" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow authenticated users to read transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow users to view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow service role full access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public read transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "service_role_transactions" ON public.transactions;
DROP POLICY IF EXISTS "users_view_own_transactions" ON public.transactions;
DROP POLICY IF EXISTS "admins_manage_transactions" ON public.transactions;

-- Create clean, simple policies
CREATE POLICY "service_role_full_access" ON public.transactions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "users_view_own" ON public.transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins_full_access" ON public.transactions
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Verify
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'transactions';
