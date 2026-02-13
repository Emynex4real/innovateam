-- ============================================
-- Payment & Pricing System Migration
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)
-- ============================================

-- 1. Student usage tracking table
CREATE TABLE IF NOT EXISTS student_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('ai_examiner', 'practice_exam')),
  exam_id TEXT,
  was_free BOOLEAN DEFAULT FALSE,
  amount_charged DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_usage_user ON student_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_student_usage_service ON student_usage(user_id, service_type);

-- RLS for student_usage
ALTER TABLE student_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own usage" ON student_usage
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service can insert usage" ON student_usage
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add trial columns to user_profiles (safe IF NOT EXISTS)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tutor_trial_granted BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS tutor_trial_expires_at TIMESTAMPTZ;

-- 3. Add missing columns to existing transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS reference TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paystack_reference TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_paystack_ref ON transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- RLS for transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service can insert transactions" ON transactions
    FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service can update transactions" ON transactions
    FOR UPDATE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Update subscription plan prices to NGN (case-insensitive match)
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'NGN';

UPDATE subscription_plans SET
  price = 0,
  currency = 'NGN',
  features = '{"analytics": "basic", "support": "community", "ai_generations": 10, "custom_branding": false}'::jsonb
WHERE LOWER(name) = 'free';

UPDATE subscription_plans SET
  price = 2000,
  currency = 'NGN',
  features = '{"analytics": "advanced", "support": "email", "ai_generations": 100, "custom_branding": false}'::jsonb
WHERE LOWER(name) = 'pro';

UPDATE subscription_plans SET
  price = 5000,
  currency = 'NGN',
  features = '{"analytics": "full", "support": "priority", "ai_generations": -1, "custom_branding": true, "api_access": true}'::jsonb
WHERE LOWER(name) = 'premium';

-- 5. Ensure wallet_balance column exists on user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0;
