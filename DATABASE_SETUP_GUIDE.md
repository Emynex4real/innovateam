# 🗄️ Database Setup - Step by Step

## ⚠️ IMPORTANT: Run in This Exact Order

---

## Step 1: Run Phase 1 (First Time Only)

**File:** `phase1_enhancements.sql`

```sql
-- Copy and paste the ENTIRE contents of phase1_enhancements.sql
-- This creates:
-- - student_analytics table
-- - achievements table
-- - student_achievements table
-- - tutor_analytics table
-- - Triggers and functions
```

**Expected Result:** ✅ "Phase 1 database enhancements completed successfully!"

---

## Step 2: Run Phase 2 (Use Fixed Version)

**File:** `phase2_schema_fixed.sql`

```sql
-- Copy and paste the ENTIRE contents of phase2_schema_fixed.sql
-- This creates:
-- - Monetization tables (5 tables)
-- - Communication tables (6 tables)
-- - Gamification tables (6 tables)
-- - Analytics tables (1 table)
```

**Expected Result:** ✅ All tables created, subscription plans seeded

---

## Step 3: Run Badge Seed

**File:** `seed_badges.sql`

```sql
-- Copy and paste the ENTIRE contents of seed_badges.sql
-- This inserts 18 badges
```

**Expected Result:** ✅ 18 badges inserted

---

## 🔧 If You Get Errors

### Error: "relation already exists"
**Solution:** Skip that file, it's already run

### Error: "column is_read does not exist"
**Solution:** Use `phase2_schema_fixed.sql` instead of `phase2_schema.sql`

### Error: "relation badges does not exist"
**Solution:** Run `phase2_schema_fixed.sql` BEFORE `seed_badges.sql`

### Error: "index already exists"
**Solution:** That's OK, it means phase1 already ran successfully

---

## ✅ Verify Installation

Run this query to check all tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'student_analytics',
  'achievements', 
  'student_achievements',
  'tutor_analytics',
  'subscription_plans',
  'tutor_subscriptions',
  'paid_tests',
  'test_purchases',
  'tutor_earnings',
  'messages',
  'announcements',
  'notifications',
  'forum_topics',
  'forum_posts',
  'forum_likes',
  'badges',
  'student_badges',
  'challenges',
  'challenge_participants',
  'study_plans',
  'study_plan_items',
  'performance_heatmaps'
)
ORDER BY table_name;
```

**Expected:** 22 tables

---

## 🎯 Quick Check Queries

### Check badges:
```sql
SELECT COUNT(*) FROM badges;
-- Expected: 18
```

### Check subscription plans:
```sql
SELECT name, price FROM subscription_plans;
-- Expected: Free ($0), Pro ($9.99), Premium ($29.99)
```

### Check achievements:
```sql
SELECT COUNT(*) FROM achievements;
-- Expected: 10
```

---

## 🔄 If You Need to Start Over

**⚠️ WARNING: This deletes ALL data!**

```sql
-- Drop Phase 2 tables
DROP TABLE IF EXISTS performance_heatmaps CASCADE;
DROP TABLE IF EXISTS study_plan_items CASCADE;
DROP TABLE IF EXISTS study_plans CASCADE;
DROP TABLE IF EXISTS challenge_participants CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS student_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS forum_likes CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_topics CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS tutor_earnings CASCADE;
DROP TABLE IF EXISTS test_purchases CASCADE;
DROP TABLE IF EXISTS paid_tests CASCADE;
DROP TABLE IF EXISTS tutor_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Drop Phase 1 tables
DROP TABLE IF EXISTS student_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS tutor_analytics CASCADE;
DROP TABLE IF EXISTS student_analytics CASCADE;

-- Now run Step 1, 2, 3 again
```

---

## 📊 Current Status Check

Run this to see what you have:

```sql
SELECT 
  'student_analytics' as table_name,
  COUNT(*) as row_count
FROM student_analytics
UNION ALL
SELECT 'achievements', COUNT(*) FROM achievements
UNION ALL
SELECT 'badges', COUNT(*) FROM badges
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans;
```

**Expected:**
- student_analytics: 0 (will fill as users take tests)
- achievements: 10
- badges: 18
- subscription_plans: 3

---

## ✅ You're Done When:

- [ ] 22 tables exist
- [ ] 10 achievements exist
- [ ] 18 badges exist
- [ ] 3 subscription plans exist
- [ ] No errors in SQL editor

---

## 🆘 Still Having Issues?

1. **Check Supabase version:** Must be PostgreSQL 14+
2. **Check permissions:** Must be project owner
3. **Try one table at a time:** Copy individual CREATE TABLE statements
4. **Check logs:** Look at Supabase logs for detailed errors

---

**Next:** Deploy backend and frontend! 🚀
