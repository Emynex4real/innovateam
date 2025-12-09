# 🚀 Quick Start: Leaderboard Setup (5 Minutes)

## Step 1: Open Supabase Dashboard (1 min)

1. Go to: https://supabase.com/dashboard
2. Login to your account
3. Select your project: `jdedscbvbkjvqmmdabig`

## Step 2: Run SQL Migration (2 min)

1. Click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button
3. Open file: `supabase/practice_leaderboard.sql` in your code editor
4. Copy **ALL** the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"** button (bottom right)
7. Wait for "Success" message

## Step 3: Verify Setup (1 min)

Run this query in SQL Editor:

```sql
SELECT COUNT(*) FROM practice_sessions;
```

If it returns a number (even 0), you're good! ✅

## Step 4: Test It (1 min)

1. Start your app: `npm start`
2. Go to **Practice Questions**
3. Complete any quiz
4. Go to **Leaderboard**
5. You should see your ranking! 🎉

---

## ✅ That's It!

Your leaderboard is now live and tracking all users!

### What Happens Now?

- ✅ Every completed quiz saves to database
- ✅ All users compete on same leaderboard
- ✅ Rankings update in real-time
- ✅ Streaks are tracked automatically
- ✅ Points calculated fairly

### Need Help?

- **Detailed Guide**: See `LEADERBOARD_SETUP.md`
- **Implementation Details**: See `LEADERBOARD_IMPLEMENTATION.md`
- **SQL File**: `supabase/practice_leaderboard.sql`

---

## 🎯 Quick Test Commands

### Check if table exists:
```sql
SELECT * FROM practice_sessions LIMIT 1;
```

### View current leaderboard:
```sql
SELECT * FROM leaderboard_stats ORDER BY points DESC LIMIT 10;
```

### Check your sessions:
```sql
SELECT * FROM practice_sessions 
WHERE user_id = auth.uid() 
ORDER BY completed_at DESC;
```

---

**Time to Complete**: ~5 minutes
**Difficulty**: Easy
**Status**: Ready to Deploy! 🚀
