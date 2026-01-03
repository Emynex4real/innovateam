-- Fixed Enhanced Security Policies

-- Drop existing policies safely
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Enhanced Users policies
CREATE POLICY "Users can view own profile" ON public.users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Enhanced Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.transactions 
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  amount > 0 AND
  amount <= 1000000
);

-- Activity logs policies
DROP POLICY IF EXISTS "Users can view own activity" ON public.activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON public.activity_logs;

CREATE POLICY "Users can view own activity" ON public.activity_logs 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" ON public.activity_logs 
FOR INSERT WITH CHECK (true);

-- Security functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed trigger function (removed OLD/NEW references for INSERT)
CREATE OR REPLACE FUNCTION public.log_sensitive_operations()
RETURNS TRIGGER AS $$
BEGIN
  -- Log large transactions on INSERT
  IF TG_TABLE_NAME = 'transactions' AND TG_OP = 'INSERT' AND NEW.amount > 100000 THEN
    INSERT INTO public.activity_logs (user_id, action, resource, metadata)
    VALUES (NEW.user_id, 'security_event', 'large_transaction', 
            jsonb_build_object('transaction_id', NEW.id, 'amount', NEW.amount));
  END IF;
  
  -- Log role changes on UPDATE
  IF TG_TABLE_NAME = 'users' AND TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.activity_logs (user_id, action, resource, metadata)
    VALUES (NEW.id, 'security_event', 'role_change', 
            jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
DROP TRIGGER IF EXISTS log_transaction_changes ON public.transactions;
CREATE TRIGGER log_transaction_changes
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();

DROP TRIGGER IF EXISTS log_user_changes ON public.users;
CREATE TRIGGER log_user_changes
  AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operations();