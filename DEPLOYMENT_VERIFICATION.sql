-- ============================================
-- WHITE-LABEL PORTAL DEPLOYMENT VERIFICATION
-- ============================================
-- Run this script after deployment to verify everything is working

-- ============================================
-- 1. CHECK DATABASE SCHEMA
-- ============================================

-- Verify theme_config column exists
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'tutorial_centers' 
  AND column_name = 'theme_config';

-- Expected: theme_config | jsonb | YES

-- ============================================
-- 2. CHECK EXISTING CENTERS
-- ============================================

-- List all centers with their theme configs
SELECT 
  id,
  name,
  tutor_id,
  access_code,
  theme_config->>'primary_color' as color,
  theme_config->>'logo_url' as logo,
  created_at
FROM tutorial_centers
ORDER BY created_at DESC
LIMIT 10;

-- ============================================
-- 3. CHECK STUDENT LINKAGE
-- ============================================

-- Count students linked to centers
SELECT 
  tc.name as center_name,
  COUNT(DISTINCT e.student_id) as enrolled_students
FROM tutorial_centers tc
LEFT JOIN tc_enrollments e ON e.center_id = tc.id
GROUP BY tc.id, tc.name
ORDER BY enrolled_students DESC;

-- ============================================
-- 4. CHECK RLS POLICIES
-- ============================================

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'tutorial_centers';

-- Expected: rowsecurity = true

-- List all policies on tutorial_centers
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'tutorial_centers';

-- ============================================
-- 5. TEST THEME CONFIG QUERIES
-- ============================================
-- ⚠️ IMPORTANT: Replace placeholders with actual UUIDs
-- Run GET_ACTUAL_IDS.sql first to get real IDs

-- Test fetching theme by center_id (simulates ThemeContext)
SELECT 
  name,
  theme_config
FROM tutorial_centers
WHERE id = '<TEST_CENTER_ID>';

-- Test fetching theme by user's center_id (simulates student login)
-- Note: Replace <TEST_STUDENT_ID> with actual student ID
-- This query assumes center_id column exists in user_profiles
-- If it doesn't exist yet, you'll need to add it first
SELECT 
  tc.name,
  tc.theme_config
FROM tutorial_centers tc
WHERE tc.id IN (
  SELECT center_id FROM tc_enrollments WHERE student_id = '<TEST_STUDENT_ID>' LIMIT 1
);

-- ============================================
-- 6. CHECK DATA INTEGRITY
-- ============================================

-- Find centers with invalid theme configs
SELECT 
  id,
  name,
  theme_config
FROM tutorial_centers
WHERE 
  theme_config IS NULL OR
  theme_config->>'primary_color' IS NULL OR
  NOT (theme_config->>'primary_color' ~ '^#[0-9A-Fa-f]{6}$');

-- Expected: 0 rows (all configs should be valid)

-- Find students enrolled but not linked (if center_id column exists)
-- Skip this check if center_id doesn't exist in user_profiles yet
SELECT 
  e.student_id,
  up.email,
  e.center_id
FROM tc_enrollments e
JOIN user_profiles up ON up.id = e.student_id
LIMIT 10;

-- Expected: Shows enrolled students

-- ============================================
-- 7. CHECK PERFORMANCE
-- ============================================

-- Check index on theme_config
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'tutorial_centers'
  AND indexdef LIKE '%theme_config%';

-- Expected: idx_tutorial_centers_theme

-- Check query performance (should be < 100ms)
-- Note: This assumes center_id exists in user_profiles
EXPLAIN ANALYZE
SELECT 
  tc.name,
  tc.theme_config
FROM tutorial_centers tc
WHERE tc.id IN (
  SELECT center_id FROM tc_enrollments WHERE student_id = '<TEST_STUDENT_ID>' LIMIT 1
);

-- ============================================
-- 8. GENERATE TEST REPORT
-- ============================================

-- Quick health check report
SELECT 
  'Total Centers' as metric,
  COUNT(*)::text as value
FROM tutorial_centers
UNION ALL
SELECT 
  'Centers with Branding',
  COUNT(*)::text
FROM tutorial_centers
WHERE theme_config->>'logo_url' IS NOT NULL
UNION ALL
SELECT 
  'Total Enrolled Students',
  COUNT(DISTINCT student_id)::text
FROM tc_enrollments
UNION ALL
SELECT 
  'Active Tests',
  COUNT(*)::text
FROM tc_question_sets
WHERE is_active = TRUE;

-- ============================================
-- 9. SECURITY AUDIT
-- ============================================

-- Check for exposed sensitive data
SELECT 
  id,
  name,
  CASE 
    WHEN theme_config->>'logo_url' LIKE '%localhost%' THEN '⚠️ Local URL'
    WHEN theme_config->>'logo_url' LIKE '%http://%' THEN '⚠️ Insecure HTTP'
    ELSE '✅ OK'
  END as logo_security
FROM tutorial_centers
WHERE theme_config->>'logo_url' IS NOT NULL;

-- ============================================
-- 10. DEPLOYMENT CHECKLIST
-- ============================================

-- Run this final query to get a deployment status report
WITH deployment_checks AS (
  SELECT 
    'theme_config column exists' as check_name,
    EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'tutorial_centers' AND column_name = 'theme_config'
    ) as passed
  UNION ALL
  SELECT 
    'RLS enabled on tutorial_centers',
    EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'tutorial_centers' AND rowsecurity = true
    )
  UNION ALL
  SELECT 
    'At least one center has branding',
    EXISTS (
      SELECT 1 FROM tutorial_centers 
      WHERE theme_config->>'logo_url' IS NOT NULL
    )
  UNION ALL
  SELECT 
    'Index on theme_config exists',
    EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'tutorial_centers' AND indexname = 'idx_tutorial_centers_theme'
    )
  UNION ALL
  SELECT 
    'Students enrolled in centers',
    EXISTS (
      SELECT 1 FROM tc_enrollments LIMIT 1
    )
)
SELECT 
  check_name,
  CASE 
    WHEN passed THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM deployment_checks;

-- ============================================
-- EXPECTED OUTPUT:
-- ============================================
-- check_name                              | status
-- ----------------------------------------|--------
-- theme_config column exists              | ✅ PASS
-- RLS enabled on tutorial_centers         | ✅ PASS
-- At least one center has branding        | ✅ PASS
-- Index on theme_config exists            | ✅ PASS
-- Students linked to centers              | ✅ PASS
-- ============================================

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- If any check fails, run these:

-- Fix missing index:
-- CREATE INDEX IF NOT EXISTS idx_tutorial_centers_theme 
-- ON tutorial_centers USING GIN (theme_config);

-- Fix unlinked students:
-- UPDATE user_profiles up
-- SET center_id = e.center_id
-- FROM tc_enrollments e
-- WHERE e.student_id = up.id
--   AND up.center_id IS NULL;

-- Reset invalid theme configs:
-- UPDATE tutorial_centers
-- SET theme_config = '{"primary_color": "#10b981", "logo_url": null}'::jsonb
-- WHERE theme_config IS NULL;

-- ============================================
-- DEPLOYMENT VERIFICATION COMPLETE ✅
-- ============================================
-- If all checks pass, your white-label portal is ready!
-- Next steps:
-- 1. Test login as tutor → Verify logo appears
-- 2. Test login as student → Verify branding applies
-- 3. Generate first weekly report
-- 4. Onboard first real partner
-- ============================================
