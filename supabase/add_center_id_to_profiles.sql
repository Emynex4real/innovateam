-- ============================================
-- ADD CENTER_ID TO USER_PROFILES
-- ============================================
-- This allows students to be linked to a primary center
-- for branding purposes (ThemeContext uses this)

-- Add center_id column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS center_id UUID REFERENCES tutorial_centers(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_center 
ON user_profiles(center_id);

-- Optionally: Auto-link students to their first enrolled center
-- Uncomment if you want to automatically set center_id for existing students
/*
UPDATE user_profiles up
SET center_id = (
  SELECT center_id 
  FROM tc_enrollments 
  WHERE student_id = up.id 
  ORDER BY enrolled_at ASC 
  LIMIT 1
)
WHERE center_id IS NULL
  AND EXISTS (SELECT 1 FROM tc_enrollments WHERE student_id = up.id);
*/

-- ============================================
-- MIGRATION COMPLETE ✅
-- ============================================
-- Next: Run add_theme_config.sql if not already done
