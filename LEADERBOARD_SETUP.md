# Leaderboard Setup Guide

## Overview
The leaderboard system has been upgraded to use a centralized database instead of localStorage, enabling real-time rankings across all users.

## Database Setup

### Step 1: Run the SQL Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `jdedscbvbkjvqmmdabig`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/practice_leaderboard.sql`
6. Click **Run** to execute the migration

This will create:
- `practice_sessions` table - Stores all practice session data
- `leaderboard_stats` view - Aggregated all-time statistics
- `leaderboard_weekly` view - Weekly rankings
- `leaderboard_monthly` view - Monthly rankings
- `calculate_user_streak()` function - Calculates daily practice streaks
- Proper RLS policies for security

### Step 2: Verify the Setup

Run this query in SQL Editor to verify:

```sql
-- Check if table exists
SELECT * FROM practice_sessions LIMIT 1;

-- Check if views exist
SELECT * FROM leaderboard_stats LIMIT 5;
SELECT * FROM leaderboard_weekly LIMIT 5;
SELECT * FROM leaderboard_monthly LIMIT 5;
```

## How It Works

### Practice Sessions
When a user completes a practice quiz:
1. Session data is saved to `practice_sessions` table
2. Data includes: questions answered, correct answers, time spent, percentage
3. Also saved to localStorage as backup

### Leaderboard Calculation
Points are calculated as:
- **10 points** per correct answer
- **50 points** per completed session
- **2x multiplier** on average score percentage

Example: 
- 8 correct answers = 80 points
- 1 completed session = 50 points
- 80% average score = 160 points
- **Total: 290 points**

### Rankings
- **All Time**: Shows lifetime statistics
- **Weekly**: Last 7 days only
- **Monthly**: Last 30 days only

### Streaks
Calculated by checking consecutive days with at least one practice session.

## Features

✅ **Real-time Rankings** - All users compete on the same leaderboard
✅ **Multiple Timeframes** - All-time, weekly, and monthly views
✅ **Streak Tracking** - Daily practice streak counter
✅ **Level System** - Level up every 50 questions answered
✅ **Performance Stats** - Average score, total sessions, accuracy
✅ **Current User Highlight** - Your rank is highlighted and shown at bottom
✅ **Top 3 Podium** - Special display for top performers
✅ **Secure** - RLS policies ensure users can only modify their own data

## Testing

### Test the System

1. **Complete a Practice Quiz**
   - Go to Practice Questions
   - Complete any quiz
   - Check that session is saved

2. **Verify Database Entry**
   ```sql
   SELECT * FROM practice_sessions 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

3. **Check Leaderboard**
   - Go to Leaderboard page
   - You should see your ranking
   - Try different timeframes (All Time, Week, Month)

4. **Test with Multiple Users**
   - Create test accounts
   - Complete quizzes with each
   - Verify all appear on leaderboard

## Migration from localStorage

Existing localStorage data will continue to work as backup, but new sessions will be saved to the database. To migrate existing data:

```javascript
// Run this in browser console (one-time migration)
const migrateLocalData = async () => {
  const user = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
  const history = JSON.parse(localStorage.getItem(`practice_history_${user.id}`) || '[]');
  
  for (const session of history) {
    await practiceSessionService.savePracticeSession({
      bankId: session.bankId,
      bankName: session.bankName,
      subject: session.subject,
      totalQuestions: session.totalQuestions,
      correctAnswers: session.correctAnswers,
      timeSpent: session.timeSpent,
      percentage: session.percentage
    });
  }
  
  console.log(`Migrated ${history.length} sessions`);
};

migrateLocalData();
```

## Troubleshooting

### Leaderboard Not Loading
- Check Supabase connection
- Verify SQL migration ran successfully
- Check browser console for errors

### Sessions Not Saving
- Verify user is authenticated
- Check RLS policies are enabled
- Ensure `practice_sessions` table exists

### Incorrect Rankings
- Refresh the page
- Check timeframe filter
- Verify points calculation in database

## Performance

The system is optimized for:
- Fast queries using database views
- Indexed columns for quick lookups
- Efficient streak calculation
- Caching of leaderboard data

## Security

- Users can only insert/update their own sessions
- All users can view leaderboard (read-only)
- RLS policies enforce data isolation
- No sensitive data exposed

## Future Enhancements

Potential improvements:
- Real-time updates using Supabase Realtime
- Badges and achievements
- Subject-specific leaderboards
- Friend challenges
- Weekly/monthly rewards
- Export statistics
