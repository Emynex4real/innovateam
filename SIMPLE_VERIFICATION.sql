-- ============================================
-- SIMPLE DEPLOYMENT VERIFICATION
-- ============================================
-- Run this script to verify deployment
-- NO PLACEHOLDERS - Works immediately!

-- ============================================
-- 1. CHECK COLUMNS EXIST
-- ============================================

-- Check if center_id exists in user_profiles
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_profiles' AND column_name = 'center_id'
    ) THEN '✅ user_profiles.center_id EXISTS'
    ELSE '❌ user_profiles.center_id MISSING'
  END as status;

-- Check if theme_config exists in tutorial_centers
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tutorial_centers' AND column_name = 'theme_config'
    ) THEN '✅ tutorial_centers.theme_config EXISTS'
    ELSE '❌ tutorial_centers.theme_config MISSING'
  END as status;

-- ============================================
-- 2. CHECK DATA
-- ============================================

-- Count centers
SELECT 
  'Total Centers' as metric,
  COUNT(*)::text as value
FROM tutorial_centers;

-- Count centers with branding
SELECT 
  'Centers with Branding' as metric,
  COUNT(*)::text as value
FROM tutorial_centers
WHERE theme_config->>'logo_url' IS NOT NULL;

-- Count enrolled students
SELECT 
  'Total Enrolled Students' as metric,
  COUNT(DISTINCT student_id)::text as value
FROM tc_enrollments;

-- Count active tests
SELECT 
  'Active Tests' as metric,
  COUNT(*)::text as value
FROM tc_question_sets
WHERE is_active = TRUE;

-- ============================================
-- 3. SHOW SAMPLE DATA
-- ============================================

-- Show first 3 centers with their themes
SELECT 
  name,
  theme_config->>'primary_color' as color,
  theme_config->>'logo_url' as logo,
  created_at
FROM tutorial_centers
ORDER BY created_at DESC
LIMIT 3;

-- Show first 3 enrolled students
SELECT 
  up.email,
  tc.name as center_name,
  e.enrolled_at
FROM tc_enrollments e
JOIN user_profiles up ON up.id = e.student_id
JOIN tutorial_centers tc ON tc.id = e.center_id
ORDER BY e.enrolled_at DESC
LIMIT 3;

-- ============================================
-- 4. CHECK INDEXES
-- ============================================

-- Check if indexes exist
SELECT 
  indexname,
  tablename
FROM pg_indexes
WHERE tablename IN ('tutorial_centers', 'user_profiles')
  AND (indexname LIKE '%theme%' OR indexname LIKE '%center%')
ORDER BY tablename, indexname;

-- ============================================
-- 5. FINAL STATUS
-- ============================================

-- Overall deployment status
WITH checks AS (
  SELECT 
    'center_id column' as check_name,
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_profiles' AND column_name = 'center_id'
    ) as passed
  UNION ALL
  SELECT 
    'theme_config column',
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tutorial_centers' AND column_name = 'theme_config'
    )
  UNION ALL
  SELECT 
    'At least one center exists',
    EXISTS (SELECT 1 FROM tutorial_centers LIMIT 1)
  UNION ALL
  SELECT 
    'RLS enabled',
    EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'tutorial_centers' AND rowsecurity = true
    )
)
SELECT 
  check_name,
  CASE 
    WHEN passed THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM checks;

-- ============================================
-- EXPECTED OUTPUT:
-- ============================================
-- All checks should show ✅ PASS
-- If any show ❌ FAIL, run the migrations again
-- ============================================
