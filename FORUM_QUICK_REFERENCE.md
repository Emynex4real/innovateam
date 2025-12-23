# 🎯 Forum System - Quick Reference Card

## 🚀 Setup (3 Commands)
```bash
# 1. Database
psql -U postgres -d your_db -f server/migrations/create-forum-tables.sql
psql -U postgres -d your_db -f server/migrations/seed-forum-categories.sql

# 2. Backend
cd server && npm start

# 3. Frontend
cd client && npm start
```

## 📁 Key Files
```
Frontend:
  src/pages/student/ForumsWrapper.jsx  ← Entry point
  src/pages/student/Forums.jsx         ← Main component
  src/services/forumsService.js        ← API calls
  src/pages/student/Forums.css         ← Styles

Backend:
  server/services/forums.service.js    ← Business logic
  server/routes/phase2Routes.js        ← API routes

Database:
  server/migrations/create-forum-tables.sql      ← Schema
  server/migrations/seed-forum-categories.sql    ← Default data
  server/migrations/verify-forum-setup.sql       ← Test script
```

## 🗄️ Database Tables (7)
```
forum_categories          ← 8 per center
forum_threads             ← Discussions
forum_posts               ← Replies
forum_votes               ← Upvotes/downvotes
forum_thread_followers    ← Notifications
forum_user_reputation     ← Gamification
forum_thread_views        ← Analytics
```

## 🎨 Default Categories (8)
```
💬 General Discussion
🔢 Mathematics
📚 English Language
🔬 Sciences
💡 Study Tips
📝 Exam Preparation
🎯 Career Guidance
🆘 Help & Support
```

## 📡 API Endpoints (10)
```javascript
GET    /api/phase2/forums/categories/:centerId
GET    /api/phase2/forums/categories/:categoryId/threads
GET    /api/phase2/forums/threads/:threadId
POST   /api/phase2/forums/threads
POST   /api/phase2/forums/threads/:threadId/posts
POST   /api/phase2/forums/posts/:postId/vote
POST   /api/phase2/forums/posts/:postId/mark-answer
POST   /api/phase2/forums/threads/:threadId/follow
POST   /api/phase2/forums/threads/:threadId/unfollow
GET    /api/phase2/forums/search/:centerId?q=query
```

## 💎 Reputation Points
```
+10  Create thread
+5   Create post
+50  Answer marked as best
+2   Receive upvote
```

## 🔍 Common Queries
```sql
-- Get all categories for a center
SELECT * FROM forum_categories WHERE center_id = 'uuid';

-- Get threads in category
SELECT * FROM forum_threads WHERE category_id = 'uuid' 
ORDER BY last_activity_at DESC;

-- Get posts in thread
SELECT * FROM forum_posts WHERE thread_id = 'uuid' 
AND is_deleted = false ORDER BY created_at;

-- Get user reputation
SELECT * FROM forum_user_reputation 
WHERE user_id = 'uuid' AND center_id = 'uuid';

-- Search threads
SELECT * FROM forum_threads 
WHERE center_id = 'uuid' 
AND (title ILIKE '%query%' OR description ILIKE '%query%');
```

## 🐛 Quick Fixes
```sql
-- No categories? Run seed:
\i server/migrations/seed-forum-categories.sql

-- Recalculate thread stats:
UPDATE forum_threads SET reply_count = (
  SELECT COUNT(*) FROM forum_posts 
  WHERE thread_id = forum_threads.id
);

-- Recalculate vote counts:
UPDATE forum_posts SET 
  upvote_count = (SELECT COUNT(*) FROM forum_votes 
    WHERE post_id = forum_posts.id AND vote_type = 'upvote'),
  downvote_count = (SELECT COUNT(*) FROM forum_votes 
    WHERE post_id = forum_posts.id AND vote_type = 'downvote');

-- Reset all forum data (DESTRUCTIVE):
TRUNCATE forum_posts, forum_threads, forum_categories CASCADE;
```

## ⚡ Performance Tips
```javascript
// Frontend
- Use pagination (20 items/page)
- Debounce search (300ms)
- Cache category list
- Lazy load images

// Backend
- Use indexes (25+ created)
- Enable connection pooling
- Add rate limiting
- Cache frequent queries

// Database
- Run VACUUM ANALYZE monthly
- Monitor slow queries
- Archive old threads
- Clean old views (90 days)
```

## 🔐 Security Checklist
```
✅ Validate all inputs
✅ Sanitize HTML content
✅ Use parameterized queries
✅ Enable RLS policies
✅ Rate limit API calls
✅ Verify user permissions
✅ Log security events
✅ Use HTTPS in production
```

## 🧪 Test Checklist
```
✅ Can see categories
✅ Can create thread
✅ Can reply to thread
✅ Can upvote/downvote
✅ Can mark answer
✅ Can follow thread
✅ Can search threads
✅ Empty states work
✅ Error handling works
✅ Mobile responsive
```

## 📊 Monitoring Queries
```sql
-- Active users today
SELECT COUNT(DISTINCT creator_id) FROM forum_threads 
WHERE created_at > CURRENT_DATE;

-- Threads created today
SELECT COUNT(*) FROM forum_threads 
WHERE created_at > CURRENT_DATE;

-- Most active category
SELECT c.name, COUNT(t.id) as threads
FROM forum_categories c
LEFT JOIN forum_threads t ON t.category_id = c.id
GROUP BY c.id, c.name
ORDER BY threads DESC LIMIT 1;

-- Top contributor
SELECT u.name, COUNT(p.id) as posts
FROM forum_posts p
JOIN user_profiles u ON u.id = p.author_id
GROUP BY u.id, u.name
ORDER BY posts DESC LIMIT 1;
```

## 🚨 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Center ID not provided" | User not in center | Join center first |
| "No categories available" | Seed not run | Run seed-forum-categories.sql |
| 401 Unauthorized | Invalid token | Check localStorage.authToken |
| 500 Server Error | DB connection | Check Supabase credentials |
| Slow queries | Missing indexes | Run verify-forum-setup.sql |

## 📞 Quick Support
```bash
# Check if tables exist
psql -c "SELECT table_name FROM information_schema.tables 
WHERE table_name LIKE 'forum%';"

# Check if categories exist
psql -c "SELECT COUNT(*) FROM forum_categories;"

# Check backend is running
curl http://localhost:5000/health

# Check frontend is running
curl http://localhost:3000
```

## 🎯 Success Criteria
```
✅ 8 categories per center
✅ Can create & reply to threads
✅ Voting system works
✅ Search returns results
✅ Page loads < 3 seconds
✅ No console errors
✅ Mobile responsive
✅ Error messages clear
```

---

**Print this card and keep it handy! 📌**

**Need more help?** See FORUM_DOCUMENTATION.md for full details.
