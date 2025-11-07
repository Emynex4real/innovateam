-- Fix transaction policies to allow service role access
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.transactions;
DROP POLICY IF EXISTS "Admin can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Service role can do everything" ON public.transactions;

-- Create new policies that work with service role
CREATE POLICY "Allow service role full access" ON public.transactions
  FOR ALL USING (true);

CREATE POLICY "Users can manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- Also fix user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.user_profiles;

CREATE POLICY "Allow service role full access" ON public.user_profiles
  FOR ALL USING (true);

CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = id);

-- Create missing user profile
INSERT INTO public.user_profiles (id, wallet_balance, created_at)
VALUES ('15ee5056-eac2-49dd-bd42-1895546543c2', 0, NOW())
ON CONFLICT (id) DO NOTHING;