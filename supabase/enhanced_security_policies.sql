-- Enhanced RLS Policies for Better Security

-- Drop existing policies to recreate with better security
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Enhanced Users policies with additional security checks
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT USING (
  auth.uid() = id AND 
  auth.jwt() ->> 'aud' = 'authenticated'
);

CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE USING (
  auth.uid() = id AND 
  auth.jwt() ->> 'aud' = 'authenticated'
) WITH CHECK (
  auth.uid() = id AND
  -- Prevent role escalation
  (OLD.role = NEW.role OR auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  ))
);

CREATE POLICY "Admins can view all users" ON public.users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin' 
    AND auth.jwt() ->> 'aud' = 'authenticated'
  )
);

-- Enhanced admin management policy
CREATE POLICY "Admins can manage users" ON public.users 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
) WITH CHECK (
  -- Prevent admin from removing their own admin role
  NOT (auth.uid() = id AND OLD.role = 'admin' AND NEW.role != 'admin')
);

-- Enhanced Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions 
FOR SELECT USING (
  auth.uid() = user_id AND 
  auth.jwt() ->> 'aud' = 'authenticated'
);

CREATE POLICY "Users can create own transactions" ON public.transactions 
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  auth.jwt() ->> 'aud' = 'authenticated' AND
  -- Prevent negative amounts
  amount > 0 AND
  -- Limit transaction amounts
  amount <= 1000000
);

-- Prevent transaction updates (immutable after creation)
CREATE POLICY "Transactions are immutable" ON public.transactions 
FOR UPDATE USING (false);

-- Only allow system to update transaction status
CREATE POLICY "System can update transaction status" ON public.transactions 
FOR UPDATE USING (
  -- Only allow status updates by service role
  auth.jwt() ->> 'role' = 'service_role'
) WITH CHECK (
  -- Only allow status field changes
  OLD.user_id = NEW.user_id AND
  OLD.amount = NEW.amount AND
  OLD.type = NEW.type AND
  OLD.reference = NEW.reference
);

-- Enhanced Activity logs policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

CREATE POLICY "Users can view own activity" ON public.activity_logs 
FOR SELECT USING (
  auth.uid() = user_id AND 
  auth.jwt() ->> 'aud' = 'authenticated'
);

CREATE POLICY "System can insert activity logs" ON public.activity_logs 
FOR INSERT WITH CHECK (
  -- Allow authenticated users to log their own activities
  (auth.uid() = user_id AND auth.jwt() ->> 'aud' = 'authenticated') OR
  -- Allow service role to log any activity
  auth.jwt() ->> 'role' = 'service_role'
);

-- Prevent activity log modifications
CREATE POLICY "Activity logs are immutable" ON public.activity_logs 
FOR UPDATE USING (false);

CREATE POLICY "Activity logs cannot be deleted" ON public.activity_logs 
FOR DELETE USING (false);

-- Enhanced security functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND auth.jwt() ->> 'aud' = 'authenticated'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  event_data JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.activity_logs (
    user_id,
    action,
    resource,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    'security_event',
    event_type,
    event_data,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operations()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes
  IF TG_TABLE_NAME = 'users' AND OLD.role != NEW.role THEN
    PERFORM public.log_security_event('role_change', jsonb_build_object(
      'user_id', NEW.id,
      'old_role', OLD.role,
      'new_role', NEW.role,
      'changed_by', auth.uid()
    ));
  END IF;
  
  -- Log large transactions
  IF TG_TABLE_NAME = 'transactions' AND NEW.amount > 100000 THEN
    PERFORM public.log_security_event('large_transaction', jsonb_build_object(
      'transaction_id', NEW.id,
      'amount', NEW.amount,
      'type', NEW.type
    ));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
CREATE TRIGGER log_user_changes
  AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

CREATE TRIGGER log_transaction_changes
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

-- Create indexes for security queries
CREATE INDEX IF NOT EXISTS idx_users_role_auth ON public.users(role) WHERE role = 'admin';
CREATE INDEX IF NOT EXISTS idx_activity_logs_security ON public.activity_logs(action, created_at) WHERE action = 'security_event';
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON public.transactions(amount) WHERE amount > 100000;