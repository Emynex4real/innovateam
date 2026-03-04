-- ============================================================
-- Add missing columns to tutor_subscriptions table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Subscription expiry date (30 days from activation)
ALTER TABLE tutor_subscriptions 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Payment method (e.g., 'paystack')
ALTER TABLE tutor_subscriptions 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Paystack payment reference for the transaction
ALTER TABLE tutor_subscriptions 
ADD COLUMN IF NOT EXISTS paystack_reference TEXT;

-- Paystack subscription code (for recurring billing)
ALTER TABLE tutor_subscriptions 
ADD COLUMN IF NOT EXISTS paystack_subscription_code TEXT;

-- When the subscription was cancelled
ALTER TABLE tutor_subscriptions 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Whether subscription auto-renews
ALTER TABLE tutor_subscriptions 
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true;
