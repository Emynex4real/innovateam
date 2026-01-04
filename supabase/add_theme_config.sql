-- ============================================
-- ADD THEME CONFIG TO TUTORIAL CENTERS
-- ============================================
-- Run this in Supabase SQL Editor

-- Add theme_config column
ALTER TABLE tutorial_centers 
ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{
  "primary_color": "#10b981",
  "logo_url": null,
  "custom_domain": null
}'::jsonb;

-- Create index for faster theme lookups
CREATE INDEX IF NOT EXISTS idx_tutorial_centers_theme 
ON tutorial_centers USING GIN (theme_config);

-- ============================================
-- MIGRATION COMPLETE ✅
-- ============================================
