-- Add unlocked_banks column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS unlocked_banks JSONB DEFAULT '[]'::jsonb;
