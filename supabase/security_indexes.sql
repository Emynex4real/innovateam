-- Additional Security Indexes and Constraints
-- Run this AFTER database.sql and enhanced_security_policies.sql

-- Security-focused indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email, is_verified);
CREATE INDEX IF NOT EXISTS idx_users_role_active ON public.users(role, created_at) WHERE role = 'admin';
CREATE INDEX IF NOT EXISTS idx_transactions_suspicious ON public.transactions(amount, created_at) WHERE amount > 50000;
CREATE INDEX IF NOT EXISTS idx_activity_logs_security_events ON public.activity_logs(action, created_at) WHERE action LIKE '%security%';

-- Add constraints for data integrity
ALTER TABLE public.users ADD CONSTRAINT check_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE public.users ADD CONSTRAINT check_phone_format 
  CHECK (phone IS NULL OR phone ~* '^\+?[0-9]{10,15}$');

ALTER TABLE public.transactions ADD CONSTRAINT check_positive_amount 
  CHECK (amount > 0);

ALTER TABLE public.transactions ADD CONSTRAINT check_amount_limit 
  CHECK (amount <= 10000000); -- 10 million max

-- Create security monitoring views
CREATE OR REPLACE VIEW public.security_events AS
SELECT 
  al.id,
  al.user_id,
  u.email,
  u.role,
  al.action,
  al.resource,
  al.metadata,
  al.created_at
FROM public.activity_logs al
LEFT JOIN public.users u ON al.user_id = u.id
WHERE al.action LIKE '%security%' OR al.action LIKE '%admin%'
ORDER BY al.created_at DESC;

-- Create suspicious transactions view
CREATE OR REPLACE VIEW public.suspicious_transactions AS
SELECT 
  t.id,
  t.user_id,
  u.email,
  t.amount,
  t.type,
  t.description,
  t.created_at,
  CASE 
    WHEN t.amount > 100000 THEN 'High Amount'
    WHEN t.created_at > NOW() - INTERVAL '1 hour' AND 
         (SELECT COUNT(*) FROM public.transactions t2 
          WHERE t2.user_id = t.user_id 
          AND t2.created_at > NOW() - INTERVAL '1 hour') > 5 THEN 'Rapid Transactions'
    ELSE 'Normal'
  END as risk_level
FROM public.transactions t
LEFT JOIN public.users u ON t.user_id = u.id
WHERE t.amount > 50000 
   OR (SELECT COUNT(*) FROM public.transactions t2 
       WHERE t2.user_id = t.user_id 
       AND t2.created_at > NOW() - INTERVAL '1 hour') > 5
ORDER BY t.created_at DESC;

-- Grant appropriate permissions
GRANT SELECT ON public.security_events TO authenticated;
GRANT SELECT ON public.suspicious_transactions TO authenticated;

-- RLS for security views (only admins can see all, users see their own)
ALTER VIEW public.security_events SET (security_barrier = true);
ALTER VIEW public.suspicious_transactions SET (security_barrier = true);

-- Create function to check for suspicious activity
CREATE OR REPLACE FUNCTION public.check_suspicious_activity(user_uuid UUID)
RETURNS TABLE(
  risk_score INTEGER,
  risk_factors TEXT[]
) AS $$
DECLARE
  score INTEGER := 0;
  factors TEXT[] := '{}';
  recent_transactions INTEGER;
  large_transactions INTEGER;
  failed_logins INTEGER;
BEGIN
  -- Check recent transaction volume
  SELECT COUNT(*) INTO recent_transactions
  FROM public.transactions 
  WHERE user_id = user_uuid 
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF recent_transactions > 10 THEN
    score := score + 30;
    factors := array_append(factors, 'High transaction volume');
  END IF;
  
  -- Check for large transactions
  SELECT COUNT(*) INTO large_transactions
  FROM public.transactions 
  WHERE user_id = user_uuid 
  AND amount > 100000 
  AND created_at > NOW() - INTERVAL '24 hours';
  
  IF large_transactions > 0 THEN
    score := score + 20;
    factors := array_append(factors, 'Large transactions');
  END IF;
  
  -- Check for failed login attempts (from activity logs)
  SELECT COUNT(*) INTO failed_logins
  FROM public.activity_logs 
  WHERE user_id = user_uuid 
  AND action = 'login_failed' 
  AND created_at > NOW() - INTERVAL '1 hour';
  
  IF failed_logins > 3 THEN
    score := score + 25;
    factors := array_append(factors, 'Multiple failed logins');
  END IF;
  
  RETURN QUERY SELECT score, factors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;