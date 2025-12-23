# 💬 Forum System - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Features](#features)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Frontend Components](#frontend-components)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

A production-ready forum system for tutorial centers with:
- **8 Default Categories** per center
- **Threaded Discussions** with nested replies
- **Voting System** (upvote/downvote)
- **Reputation & Gamification**
- **Real-time Updates** via triggers
- **Full-text Search**
- **Thread Following** for notifications

### Tech Stack
- **Frontend:** React 18, React Router, CSS3
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT tokens

---

## 🚀 Quick Start

### 1. Database Setup (5 minutes)

```bash
# Connect to your database
psql -U postgres -d your_database

# Run migrations in order
\i server/migrations/create-forum-tables.sql
\i server/migrations/seed-forum-categories.sql

# Verify setup
\i server/migrations/verify-forum-setup.sql
```

### 2. Backend Setup (2 minutes)

```bash
cd server
npm install
npm start  # Runs on port 5000
```

### 3. Frontend Setup (2 minutes)

```bash
cd client  # or root if React is in root
npm install
npm start  # Runs on port 3000
```

### 4. Test It! (1 minute)

1. Login as a student
2. Join a tutorial center
3. Navigate to `/student/forums`
4. You should see 8 categories!

---

## 🏗️ Architecture

### System Flow
```
User → ForumsWrapper → Forums Component → ForumsService → Backend API → Database
```

### Component Hierarchy
```
ForumsWrapper (handles center selection)
  └── Forums (main component)
      ├── Categories View
      ├── Threads View
      │   └── Thread List
      └── Thread Detail View
          ├── Original Post
          ├── Replies (PostCard)
          └── Reply Form
```

### Database Structure
```
tutorial_centers
    ↓
forum_categories (8 per center)
    ↓
forum_threads
    ↓
forum_posts (with nested replies)
    ↓
forum_votes
```

---

## ✨ Features

### Core Features

#### 1. Categories (8 Default)
- 💬 General Discussion
- 🔢 Mathematics
- 📚 English Language
- 🔬 Sciences
- 💡 Study Tips
- 📝 Exam Preparation
- 🎯 Career Guidance
- 🆘 Help & Support

#### 2. Thread Management
- Create threads with title & description
- Add tags for better discovery
- Pin important threads
- Lock threads to prevent replies
- Mark threads as solved
- Feature threads for visibility

#### 3. Posting & Replies
- Create top-level posts
- Reply to posts (nested)
- Edit posts (tracked)
- Delete posts (soft delete)
- Rich text support (future)

#### 4. Voting System
- Upvote helpful posts
- Downvote unhelpful posts
- Toggle votes (click again to remove)
- Vote counts displayed

#### 5. Reputation System
- **+10 points** - Create thread
- **+5 points** - Create post
- **+50 points** - Answer marked as best
- **+2 points** - Receive upvote

#### 6. Thread Following
- Follow threads for updates
- Notification on new replies
- Unfollow anytime

#### 7. Search
- Full-text search across titles
- Search in descriptions
- Filter by category
- Sort by relevance

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api/phase2/forums
```

### Authentication
All endpoints require Bearer token:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN',
  'Content-Type': 'application/json'
}
```

### Endpoints

#### Get Categories
```http
GET /forums/categories/:centerId
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Mathematics",
      "description": "Math problems and solutions",
      "icon": "🔢",
      "color": "#10B981",
      "thread_count": 15,
      "post_count": 87
    }
  ]
}
```

#### Get Threads in Category
```http
GET /forums/categories/:categoryId/threads?page=1&limit=20
```

#### Get Thread with Posts
```http
GET /forums/threads/:threadId
```

#### Create Thread
```http
POST /forums/threads
Content-Type: application/json

{
  "categoryId": "uuid",
  "centerId": "uuid",
  "title": "How to solve quadratic equations?",
  "description": "I need help with...",
  "tags": ["mathematics", "algebra"]
}
```

#### Create Post (Reply)
```http
POST /forums/threads/:threadId/posts
Content-Type: application/json

{
  "content": "Here's how to solve it...",
  "parentPostId": "uuid" // optional, for nested replies
}
```

#### Vote on Post
```http
POST /forums/posts/:postId/vote
Content-Type: application/json

{
  "voteType": "upvote" // or "downvote"
}
```

#### Mark as Answer
```http
POST /forums/posts/:postId/mark-answer
Content-Type: application/json

{
  "threadId": "uuid"
}
```

#### Follow Thread
```http
POST /forums/threads/:threadId/follow
```

#### Unfollow Thread
```http
POST /forums/threads/:threadId/unfollow
```

#### Search Threads
```http
GET /forums/search/:centerId?q=quadratic&page=1&limit=20
```

---

## 🗄️ Database Schema

### Tables

#### forum_categories
```sql
id              UUID PRIMARY KEY
center_id       UUID REFERENCES tutorial_centers
name            VARCHAR(100)
description     TEXT
slug            VARCHAR(100)
icon            VARCHAR(50)
color           VARCHAR(7)
display_order   INTEGER
is_archived     BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### forum_threads
```sql
id                UUID PRIMARY KEY
category_id       UUID REFERENCES forum_categories
center_id         UUID REFERENCES tutorial_centers
creator_id        UUID REFERENCES user_profiles
title             VARCHAR(255)
description       TEXT
slug              VARCHAR(255)
is_pinned         BOOLEAN
is_locked         BOOLEAN
is_solved         BOOLEAN
is_featured       BOOLEAN
view_count        INTEGER
reply_count       INTEGER
upvote_count      INTEGER
tags              TEXT[]
last_activity_at  TIMESTAMP
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### forum_posts
```sql
id                UUID PRIMARY KEY
thread_id         UUID REFERENCES forum_threads
author_id         UUID REFERENCES user_profiles
parent_post_id    UUID REFERENCES forum_posts
content           TEXT
content_html      TEXT
is_marked_answer  BOOLEAN
is_edited         BOOLEAN
is_deleted        BOOLEAN
upvote_count      INTEGER
downvote_count    INTEGER
edited_at         TIMESTAMP
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

### Indexes (25+)
- Category lookups
- Thread sorting by activity
- Post filtering
- Full-text search
- Vote aggregation
- User reputation

### Triggers (5)
- Auto-update reply counts
- Auto-update vote counts
- Auto-update reputation
- Auto-update timestamps
- Auto-create categories for new centers

---

## 🎨 Frontend Components

### ForumsWrapper.jsx
**Purpose:** Handles center selection and user context

**Props:** None (uses hooks)

**Features:**
- Fetches user's enrolled centers
- Auto-selects last used center
- Shows "Join Center" message if no centers
- Passes centerId and user data to Forums

### Forums.jsx
**Purpose:** Main forum interface

**Props:**
```javascript
{
  centerId: string,    // Required
  userId: string,      // Required
  userName: string,    // Required
  userAvatar: string   // Optional
}
```

**Views:**
1. **Categories View** - Grid of 8 categories
2. **Threads View** - List of threads in category
3. **Thread Detail** - Full thread with replies

### PostCard.jsx
**Purpose:** Displays individual post/reply

**Props:**
```javascript
{
  post: object,
  isAnswer: boolean,
  canMarkAnswer: boolean,
  onVote: function,
  onMarkAnswer: function
}
```

---

## 🔧 Troubleshooting

### Issue: "Center ID not provided"

**Cause:** User hasn't joined a tutorial center

**Solution:**
```javascript
// Navigate user to join center page
navigate('/student/centers/join');
```

### Issue: "No categories available"

**Cause:** Seed migration not run

**Solution:**
```bash
psql -U postgres -d your_database -f server/migrations/seed-forum-categories.sql
```

### Issue: Categories show 0 threads

**Cause:** This is normal for new forums

**Solution:** Create a test thread or wait for users to post

### Issue: 401 Unauthorized

**Cause:** Invalid or missing auth token

**Solution:**
```javascript
// Check token exists
const token = localStorage.getItem('authToken');
console.log('Token:', token ? 'Present' : 'Missing');

// Verify token format
if (token && !token.startsWith('Bearer ')) {
  // Token should be just the JWT, not prefixed
}
```

### Issue: Slow performance

**Cause:** Missing indexes or large dataset

**Solution:**
```sql
-- Check if indexes exist
SELECT * FROM pg_indexes WHERE tablename LIKE 'forum%';

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM forum_threads 
WHERE center_id = 'your-id' 
ORDER BY last_activity_at DESC;
```

### Issue: Votes not updating

**Cause:** Trigger not working

**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname LIKE '%vote%';

-- Manually recalculate
UPDATE forum_posts SET 
  upvote_count = (SELECT COUNT(*) FROM forum_votes WHERE post_id = forum_posts.id AND vote_type = 'upvote'),
  downvote_count = (SELECT COUNT(*) FROM forum_votes WHERE post_id = forum_posts.id AND vote_type = 'downvote');
```

---

## 📊 Performance Optimization

### Database
- ✅ 25+ indexes for fast queries
- ✅ Triggers for real-time updates
- ✅ Views for complex queries
- ✅ Pagination support (20 items/page)

### Frontend
- ✅ Lazy loading of threads
- ✅ Debounced search (300ms)
- ✅ Optimistic UI updates
- ✅ Error boundaries

### Backend
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Rate limiting (future)
- ✅ Caching (future)

---

## 🚀 Deployment

### Environment Variables

**Backend (.env):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
PORT=5000
NODE_ENV=production
```

**Frontend (.env):**
```env
REACT_APP_API_URL=https://your-backend.com
REACT_APP_ENV=production
```

### Production Checklist

- [ ] Run all migrations on production DB
- [ ] Verify indexes created
- [ ] Test with production data
- [ ] Enable RLS policies
- [ ] Set up monitoring
- [ ] Configure CORS
- [ ] Enable rate limiting
- [ ] Set up error tracking
- [ ] Configure backups
- [ ] Load test endpoints

---

## 📈 Analytics & Monitoring

### Key Metrics to Track
- Thread creation rate
- Post creation rate
- Active users per day
- Average response time
- Search queries
- Most popular categories
- User reputation distribution

### Queries for Analytics
```sql
-- Daily activity
SELECT DATE(created_at), COUNT(*) 
FROM forum_threads 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC;

-- Top contributors
SELECT u.name, COUNT(p.id) as post_count
FROM forum_posts p
JOIN user_profiles u ON u.id = p.author_id
GROUP BY u.id, u.name
ORDER BY post_count DESC
LIMIT 10;

-- Popular categories
SELECT c.name, COUNT(t.id) as thread_count
FROM forum_categories c
LEFT JOIN forum_threads t ON t.category_id = c.id
GROUP BY c.id, c.name
ORDER BY thread_count DESC;
```

---

## 🎓 Best Practices

### For Users
1. Search before posting
2. Use descriptive titles
3. Add relevant tags
4. Mark helpful answers
5. Follow threads you're interested in

### For Moderators
1. Pin important announcements
2. Lock resolved threads
3. Feature quality content
4. Monitor for spam
5. Encourage participation

### For Developers
1. Always validate input
2. Sanitize HTML content
3. Use transactions for complex operations
4. Log errors properly
5. Monitor performance

---

## 📞 Support

### Common Questions

**Q: Can I customize the categories?**
A: Yes! Edit the `seed-forum-categories.sql` file before running it.

**Q: How do I add more categories later?**
A: Insert directly into `forum_categories` table with proper center_id.

**Q: Can users create their own categories?**
A: Not by default. This is a tutor/admin feature (future).

**Q: How do I backup forum data?**
A: Use `pg_dump` to backup all forum_* tables.

**Q: Can I migrate to a different database?**
A: Yes, but you'll need to adjust SQL syntax (PostgreSQL-specific features used).

---

## 🔮 Future Enhancements

### Phase 2 (Planned)
- [ ] Rich text editor (Markdown)
- [ ] File attachments
- [ ] @mentions
- [ ] Email notifications
- [ ] Moderator dashboard
- [ ] Report system
- [ ] User badges
- [ ] Trending algorithm

### Phase 3 (Ideas)
- [ ] Private messaging
- [ ] Live chat
- [ ] Video embeds
- [ ] Code syntax highlighting
- [ ] LaTeX math support
- [ ] Mobile app
- [ ] Push notifications
- [ ] AI-powered suggestions

---

## 📄 License

MIT License - Feel free to use and modify

---

## 🙏 Credits

Built with ❤️ for InnovaTeam
- Database: PostgreSQL + Supabase
- Frontend: React
- Backend: Node.js + Express

---

**Version:** 1.0.0  
**Last Updated:** 2025  
**Status:** ✅ Production Ready
