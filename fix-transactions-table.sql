-- Fix transactions table for admin credit/debit
-- Run this in Supabase SQL Editor

-- 1. Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;

-- 2. Add missing columns if needed
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'credit';

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'successful';

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4. Drop old policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "service_role_transactions" ON public.transactions;

-- 5. Create new policies
CREATE POLICY "service_role_transactions" ON public.transactions
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "users_view_own_transactions" ON public.transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "admins_manage_transactions" ON public.transactions
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 6. Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'transactions';
