-- Fix wallet function to include user_email
-- Run this in Supabase SQL Editor

DROP FUNCTION IF EXISTS public.admin_adjust_wallet;

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
  target_email TEXT;
  result JSON;
BEGIN
  admin_user_id := auth.uid();
  
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = admin_user_id 
    AND (role = 'admin' OR is_admin = true)
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin privileges required';
  END IF;
  
  IF adjustment_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF adjustment_type NOT IN ('credit', 'debit') THEN
    RAISE EXCEPTION 'Type must be credit or debit';
  END IF;
  
  SELECT wallet_balance, email INTO current_balance, target_email
  FROM user_profiles
  WHERE id = target_user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  IF adjustment_type = 'credit' THEN
    new_balance := current_balance + adjustment_amount;
  ELSE
    new_balance := current_balance - adjustment_amount;
    IF new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
  END IF;
  
  UPDATE user_profiles
  SET wallet_balance = new_balance,
      updated_at = NOW()
  WHERE id = target_user_id;
  
  INSERT INTO transactions (
    user_id,
    user_email,
    amount,
    type,
    status,
    description
  ) VALUES (
    target_user_id,
    target_email,
    adjustment_amount,
    adjustment_type,
    'successful',
    COALESCE(admin_notes, 'Admin adjustment')
  ) RETURNING id INTO transaction_id;
  
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

GRANT EXECUTE ON FUNCTION public.admin_adjust_wallet TO authenticated;
