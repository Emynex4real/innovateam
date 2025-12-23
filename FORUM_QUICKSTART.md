# 🚀 FORUM QUICK START GUIDE

## ⚡ Get Forum Running in 5 Minutes

### **Step 1: Database Setup** (2 minutes)

```bash
# Option A: Using Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Copy contents of: server/migrations/create-forum-tables.sql
5. Click "Run"
6. Wait for "Success" message

# Option B: Using psql
psql -h your-db-host -U postgres -d your-db-name -f server/migrations/create-forum-tables.sql
```

### **Step 2: Seed Categories** (1 minute)

```bash
# Get your tutorial center ID first
# Then run:
cd server
node scripts/setupForumCategories.js YOUR_CENTER_ID_HERE

# Example:
# node scripts/setupForumCategories.js 123e4567-e89b-12d3-a456-426614174000
```

### **Step 3: Restart Server** (30 seconds)

```bash
# Stop current server (Ctrl+C)
# Then restart:
cd server
npm start

# You should see:
# 🔒 InnovaTeam SECURE Server Started
# 📍 URL: http://0.0.0.0:5000
```

### **Step 4: Test Frontend** (1 minute)

```bash
# In a new terminal:
cd client
npm start

# Browser should open to http://localhost:3000
```

### **Step 5: Verify It Works** (30 seconds)

1. Login to your app
2. Navigate to Forums page
3. You should see 8 categories
4. Click any category
5. Click "New Thread"
6. Create a test thread
7. ✅ Success!

---

## 🧪 Quick Test Script

```javascript
// Test in browser console:

// 1. Test categories
fetch('http://localhost:5000/api/phase2/forums/categories/YOUR_CENTER_ID', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(r => r.json())
.then(d => console.log('Categories:', d));

// 2. Test create thread
fetch('http://localhost:5000/api/phase2/forums/threads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    categoryId: 'CATEGORY_ID',
    centerId: 'CENTER_ID',
    title: 'Test Thread - Please Ignore',
    description: 'This is a test thread to verify the forum is working correctly.'
  })
})
.then(r => r.json())
.then(d => console.log('Thread created:', d));
```

---

## 🔍 Troubleshooting

### **Problem: "Center ID not provided"**
**Solution:** Make sure you're passing the correct center ID from your app state.

```javascript
// In Forums.jsx, check:
const Forums = ({ centerId, userId, userName, userAvatar }) => {
  console.log('Center ID:', centerId); // Should not be undefined
  // ...
}
```

### **Problem: "Table does not exist"**
**Solution:** Database migration didn't run. Go back to Step 1.

```bash
# Check if tables exist:
psql -h your-db-host -U postgres -d your-db-name -c "\dt forum_*"

# Should show:
# forum_categories
# forum_threads
# forum_posts
# forum_votes
# forum_thread_followers
# forum_user_reputation
# forum_thread_views
```

### **Problem: "Authentication failed"**
**Solution:** Token not being sent correctly.

```javascript
// Check localStorage:
console.log('Token:', localStorage.getItem('authToken'));

// Should return a JWT token, not null
```

### **Problem: Categories show 0 threads/posts**
**Solution:** This is normal for a fresh install. Create some threads!

### **Problem: "Failed to fetch"**
**Solution:** Backend not running or CORS issue.

```bash
# Check if backend is running:
curl http://localhost:5000/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

---

## 📝 Common Tasks

### **Add a New Category**

```sql
INSERT INTO forum_categories (center_id, name, description, slug, icon, color, display_order)
VALUES (
  'your-center-id',
  'New Category',
  'Description here',
  'new-category',
  '🎯',
  '#FF6B6B',
  9
);
```

### **Delete a Thread**

```sql
-- Soft delete (recommended):
UPDATE forum_threads SET is_locked = true WHERE id = 'thread-id';

-- Hard delete (cascades to posts):
DELETE FROM forum_threads WHERE id = 'thread-id';
```

### **Reset User Reputation**

```sql
UPDATE forum_user_reputation 
SET reputation_points = 0,
    helpful_answers_count = 0,
    best_answers_count = 0
WHERE user_id = 'user-id';
```

### **Find Most Active Users**

```sql
SELECT 
  u.name,
  r.reputation_points,
  r.total_posts_count,
  r.best_answers_count
FROM forum_user_reputation r
JOIN user_profiles u ON r.user_id = u.id
WHERE r.center_id = 'your-center-id'
ORDER BY r.reputation_points DESC
LIMIT 10;
```

### **Find Unanswered Questions**

```sql
SELECT 
  t.id,
  t.title,
  t.created_at,
  u.name as creator
FROM forum_threads t
JOIN user_profiles u ON t.creator_id = u.id
WHERE t.center_id = 'your-center-id'
  AND t.is_solved = false
  AND t.reply_count = 0
ORDER BY t.created_at DESC;
```

---

## 🎯 Feature Flags

Want to disable certain features? Update the frontend:

```javascript
// In Forums.jsx, add at the top:
const FEATURES = {
  FOLLOW_THREADS: true,      // Set to false to hide follow button
  VOTING: true,              // Set to false to hide voting
  MARK_ANSWER: true,         // Set to false to hide mark answer
  SEARCH: true,              // Set to false to hide search
  CREATE_THREAD: true,       // Set to false to hide create button
};

// Then use throughout component:
{FEATURES.FOLLOW_THREADS && (
  <button onClick={handleFollowThread}>Follow</button>
)}
```

---

## 📊 Monitoring

### **Check Forum Health**

```sql
-- Total stats
SELECT 
  (SELECT COUNT(*) FROM forum_categories WHERE is_archived = false) as categories,
  (SELECT COUNT(*) FROM forum_threads) as threads,
  (SELECT COUNT(*) FROM forum_posts WHERE is_deleted = false) as posts,
  (SELECT COUNT(DISTINCT user_id) FROM forum_posts) as active_users;

-- Today's activity
SELECT 
  COUNT(*) as threads_today
FROM forum_threads
WHERE created_at > CURRENT_DATE;

SELECT 
  COUNT(*) as posts_today
FROM forum_posts
WHERE created_at > CURRENT_DATE;
```

### **Performance Check**

```sql
-- Slow queries (if you have pg_stat_statements enabled)
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE query LIKE '%forum_%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename LIKE 'forum_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change default admin passwords
- [ ] Enable RLS policies
- [ ] Set up rate limiting
- [ ] Enable CSRF protection
- [ ] Configure CORS properly
- [ ] Set up SSL/TLS
- [ ] Enable audit logging
- [ ] Set up backup strategy
- [ ] Configure monitoring alerts
- [ ] Review user permissions

---

## 📞 Need Help?

1. **Check Documentation:** `FORUM_IMPLEMENTATION.md`
2. **Check Summary:** `FORUM_SUMMARY.md`
3. **Check Logs:** `server/logs/`
4. **Check Console:** Browser DevTools
5. **Check Database:** Supabase Dashboard

---

## 🎉 You're Done!

Your forum is now running! Here's what users can do:

✅ Browse categories
✅ Create discussion threads
✅ Reply to threads
✅ Upvote/downvote posts
✅ Mark best answers
✅ Follow threads for notifications
✅ Search discussions
✅ Earn reputation points

**Enjoy your new forum system!** 🚀

---

**Pro Tip:** Create a few sample threads yourself to show users how it works!
