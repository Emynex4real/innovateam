# 🚀 Deploy Anti-Cheat System (2 Minutes)

## Quick Deploy Steps

### Step 1: Run Migration (1 minute)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy ALL contents from: `supabase/anti_cheat_migration.sql`
5. Paste and click **Run**
6. Wait for "Success" message

### Step 2: Verify (30 seconds)

Run this query to verify:

```sql
SELECT 
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE is_first_attempt) as first_attempts,
  COUNT(*) FILTER (WHERE NOT is_first_attempt) as retakes,
  SUM(points_awarded) as total_points
FROM practice_sessions;
```

You should see counts for first attempts and retakes.

### Step 3: Test (30 seconds)

1. Complete any practice quiz
2. Check the toast message
3. Complete the SAME quiz again
4. Message should say "No points for retakes"

---

## ✅ What This Does

### Prevents Cheating
- Users can only earn points ONCE per exam
- Retakes give 0 points
- Encourages trying different exams

### User Experience
- **First attempt**: "🎉 Great! You earned 290 points!"
- **Retake**: "📝 Practice completed! (No points for retakes)"
- Can still practice without pressure

### Leaderboard
- Shows "unique exams attempted"
- Fair rankings based on variety
- Rewards breadth of knowledge

---

## 📊 Example

### Before (Cheating Possible)
```
Complete Math Quiz 10 times = 3,000 points ❌
```

### After (Fair System)
```
Complete Math Quiz 10 times = 290 points (first only) ✅
Complete 10 different quizzes = 2,900 points ✅
```

---

## 🧪 Quick Test

```bash
# 1. Complete a new quiz → Should earn points
# 2. Complete same quiz → Should NOT earn points
# 3. Complete different quiz → Should earn points
```

---

## 🔍 Monitor

Check for suspicious activity:

```sql
-- Users with many retakes
SELECT 
  user_id,
  bank_name,
  COUNT(*) as attempts,
  SUM(points_awarded) as points
FROM practice_sessions
GROUP BY user_id, bank_name
HAVING COUNT(*) > 5
ORDER BY attempts DESC;
```

---

**Time Required**: 2 minutes
**Difficulty**: Easy
**Impact**: Prevents all point farming
**Status**: ✅ Ready to Deploy
