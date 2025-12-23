-- ============================================
-- FORUM SYSTEM - VERIFICATION SCRIPT
-- Run this to verify your forum setup is correct
-- ============================================

-- 1. Check if all tables exist
SELECT 
  'Tables Check' as test_name,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ PASS - All 7 tables exist'
    ELSE '❌ FAIL - Missing tables: ' || (7 - COUNT(*))::text
  END as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'forum_categories',
    'forum_threads',
    'forum_posts',
    'forum_votes',
    'forum_thread_followers',
    'forum_user_reputation',
    'forum_thread_views'
  );

-- 2. Check if indexes exist
SELECT 
  'Indexes Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 20 THEN '✅ PASS - ' || COUNT(*)::text || ' indexes created'
    ELSE '⚠️  WARNING - Only ' || COUNT(*)::text || ' indexes found'
  END as result
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename LIKE 'forum%';

-- 3. Check if triggers exist
SELECT 
  'Triggers Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS - ' || COUNT(*)::text || ' triggers active'
    ELSE '❌ FAIL - Missing triggers'
  END as result
FROM pg_trigger 
WHERE tgname LIKE '%forum%';

-- 4. Check if views exist
SELECT 
  'Views Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✅ PASS - Helper views created'
    ELSE '⚠️  WARNING - Views missing'
  END as result
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE 'forum%';

-- 5. Check if categories were seeded
SELECT 
  'Categories Check' as test_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS - ' || COUNT(*)::text || ' categories exist'
    ELSE '❌ FAIL - No categories found. Run seed-forum-categories.sql'
  END as result
FROM forum_categories;

-- 6. Check categories per center
SELECT 
  'Categories Distribution' as test_name,
  tc.name as center_name,
  COUNT(fc.id) as category_count,
  CASE 
    WHEN COUNT(fc.id) = 8 THEN '✅ Complete'
    WHEN COUNT(fc.id) > 0 THEN '⚠️  Incomplete'
    ELSE '❌ Missing'
  END as status
FROM tutorial_centers tc
LEFT JOIN forum_categories fc ON fc.center_id = tc.id
GROUP BY tc.id, tc.name
ORDER BY tc.name;

-- 7. Check if functions exist
SELECT 
  'Functions Check' as test_name,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ PASS - Helper functions created'
    ELSE '⚠️  WARNING - Some functions missing'
  END as result
FROM pg_proc 
WHERE proname LIKE '%forum%' OR proname LIKE '%thread%';

-- 8. Sample data check
SELECT 
  'Sample Data' as test_name,
  'Threads: ' || COUNT(DISTINCT ft.id)::text || 
  ' | Posts: ' || COUNT(DISTINCT fp.id)::text ||
  ' | Users: ' || COUNT(DISTINCT ft.creator_id)::text as result
FROM forum_threads ft
LEFT JOIN forum_posts fp ON fp.thread_id = ft.id;

-- 9. Performance check - Index usage
EXPLAIN ANALYZE
SELECT * FROM forum_threads 
WHERE center_id = (SELECT id FROM tutorial_centers LIMIT 1)
ORDER BY last_activity_at DESC 
LIMIT 20;

-- 10. Final Summary
SELECT 
  '=== FORUM SETUP SUMMARY ===' as summary,
  (SELECT COUNT(*) FROM forum_categories) as total_categories,
  (SELECT COUNT(*) FROM forum_threads) as total_threads,
  (SELECT COUNT(*) FROM forum_posts) as total_posts,
  (SELECT COUNT(DISTINCT center_id) FROM forum_categories) as centers_with_forums;

-- ============================================
-- QUICK FIX COMMANDS (if needed)
-- ============================================

-- If categories are missing, run:
-- \i server/migrations/seed-forum-categories.sql

-- If tables are missing, run:
-- \i server/migrations/create-forum-tables.sql

-- To manually create categories for a specific center:
-- SELECT create_default_forum_categories('your-center-id-here');

-- To check a specific center's categories:
-- SELECT * FROM forum_categories WHERE center_id = 'your-center-id';

-- ============================================
-- CLEANUP COMMANDS (use with caution!)
-- ============================================

-- To reset all forum data (DESTRUCTIVE):
-- TRUNCATE forum_posts, forum_threads, forum_categories CASCADE;

-- To drop all forum tables (VERY DESTRUCTIVE):
-- DROP TABLE IF EXISTS forum_thread_views, forum_user_reputation, 
--   forum_thread_followers, forum_votes, forum_posts, 
--   forum_threads, forum_categories CASCADE;
