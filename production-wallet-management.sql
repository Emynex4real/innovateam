-- PRODUCTION-GRADE WALLET MANAGEMENT
-- Senior Engineer Approach

-- 1. Create a secure stored procedure for wallet operations
CREATE OR REPLACE FUNCTION public.admin_adjust_wallet(
  target_user_id UUID,
  adjustment_amount DECIMAL(10,2),
  adjustment_type TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  current_balance DECIMAL(10,2);
  new_balance DECIMAL(10,2);
  transaction_id UUID;
  admin_user_id UUID;
  result JSON;
BEGIN
  -- Get the calling user's ID
  admin_user_id := auth.uid();
  
  -- Verify admin privileges
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = admin_user_id 
    AND (role = 'admin' OR is_admin = true)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required';
  END IF;
  
  -- Validate inputs
  IF adjustment_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF adjustment_type NOT IN ('credit', 'debit') THEN
    RAISE EXCEPTION 'Type must be credit or debit';
  END IF;
  
  -- Get current balance with row lock
  SELECT wallet_balance INTO current_balance
  FROM user_profiles
  WHERE id = target_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Calculate new balance
  IF adjustment_type = 'credit' THEN
    new_balance := current_balance + adjustment_amount;
  ELSE
    new_balance := current_balance - adjustment_amount;
    IF new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
  END IF;
  
  -- Update wallet balance
  UPDATE user_profiles
  SET wallet_balance = new_balance,
      updated_at = NOW()
  WHERE id = target_user_id;
  
  -- Create transaction record
  INSERT INTO transactions (
    user_id,
    amount,
    type,
    status,
    description,
    metadata
  ) VALUES (
    target_user_id,
    adjustment_amount,
    adjustment_type,
    'successful',
    COALESCE(admin_notes, 'Admin adjustment'),
    jsonb_build_object(
      'admin_id', admin_user_id,
      'previous_balance', current_balance,
      'new_balance', new_balance,
      'timestamp', NOW()
    )
  ) RETURNING id INTO transaction_id;
  
  -- Return result
  result := json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_balance,
    'new_balance', new_balance,
    'message', 'Wallet adjusted successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_adjust_wallet TO authenticated;

-- 3. Create audit log table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES public.user_profiles(id),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_audit_log" ON public.admin_actions
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 4. Test the function
-- SELECT * FROM public.admin_adjust_wallet(
--   'user-uuid-here'::UUID,
--   1000.00,
--   'credit',
--   'Test credit from admin'
-- );
