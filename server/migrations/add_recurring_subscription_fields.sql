-- ============================================================
-- Add columns for Paystack recurring billing support
-- Run this in your Supabase SQL Editor
-- ============================================================

-- tutor_subscriptions: Add recurring billing tracking columns
ALTER TABLE tutor_subscriptions 
ADD COLUMN IF NOT EXISTS paystack_email_token TEXT;

ALTER TABLE tutor_subscriptions 
ADD COLUMN IF NOT EXISTS next_payment_date TIMESTAMPTZ;

ALTER TABLE tutor_subscriptions 
ADD COLUMN IF NOT EXISTS renewal_count INTEGER DEFAULT 0;

-- subscription_plans: Cache Paystack plan codes
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS paystack_plan_code TEXT;

-- Add index for finding expired subscriptions efficiently
CREATE INDEX IF NOT EXISTS idx_tutor_subscriptions_active_end_date 
ON tutor_subscriptions (status, end_date) 
WHERE status = 'active';
