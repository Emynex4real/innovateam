-- =====================================================
-- FINAL FIX: Transactions INSERT Policy with Type Casting
-- =====================================================

-- Check current table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND column_name IN ('id', 'user_id');

-- Drop existing policy
DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;

-- Create policy with explicit UUID casting
CREATE POLICY "transactions_insert_own"
ON transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::uuid = user_id::uuid);

-- Verify the policy
SELECT 
  policyname, 
  cmd,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'transactions' 
  AND policyname = 'transactions_insert_own';

-- Test if auth.uid() returns a value (run this while logged in)
SELECT auth.uid() as current_user_id;
