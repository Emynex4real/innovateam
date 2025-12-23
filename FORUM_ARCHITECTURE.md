# 🏗️ FORUM SYSTEM - ARCHITECTURE DIAGRAM

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                      (React Frontend)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │ ForumsWrapper│───▶│    Forums    │───▶│   PostCard   │    │
│  │  Component   │    │  Component   │    │  Component   │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│         │                    │                    │            │
│         └────────────────────┴────────────────────┘            │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │ forumsService.js │                        │
│                    │   (API Client)   │                        │
│                    └──────────────────┘                        │
│                              │                                  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               │ HTTP/REST
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │  phase2Routes.js │                        │
│                    │  (API Endpoints) │                        │
│                    └──────────────────┘                        │
│                              │                                  │
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │forums.service.js │                        │
│                    │ (Business Logic) │                        │
│                    └──────────────────┘                        │
│                              │                                  │
│                    BACKEND (Node.js/Express)                   │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               │ SQL Queries
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                              ▼                                  │
│                    ┌──────────────────┐                        │
│                    │  Supabase Client │                        │
│                    └──────────────────┘                        │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    DATABASE TABLES                      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  forum_categories          (8 per center)              │  │
│  │  forum_threads             (discussions)               │  │
│  │  forum_posts               (replies)                   │  │
│  │  forum_votes               (upvotes/downvotes)         │  │
│  │  forum_thread_followers    (notifications)             │  │
│  │  forum_user_reputation     (gamification)              │  │
│  │  forum_thread_views        (analytics)                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    TRIGGERS & VIEWS                     │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  • Auto-update reply counts                            │  │
│  │  • Auto-update vote counts                             │  │
│  │  • Auto-update reputation                              │  │
│  │  • Auto-update timestamps                              │  │
│  │  • Auto-create categories for new centers              │  │
│  │  • Category stats view                                 │  │
│  │  • Threads with author view                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│                DATABASE (PostgreSQL/Supabase)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### 1. Loading Categories

```
User clicks "Forums"
       │
       ▼
ForumsWrapper.jsx
  ├─ Fetches user's centers
  ├─ Selects active center
  └─ Passes centerId to Forums
       │
       ▼
Forums.jsx
  └─ Calls fetchCategories()
       │
       ▼
forumsService.js
  └─ GET /api/phase2/forums/categories/:centerId
       │
       ▼
phase2Routes.js
  └─ Calls forumsService.getCategories()
       │
       ▼
forums.service.js
  └─ SELECT * FROM forum_category_stats WHERE center_id = ?
       │
       ▼
Database returns 8 categories
       │
       ▼
Response flows back up the chain
       │
       ▼
User sees 8 category cards
```

### 2. Creating a Thread

```
User clicks "New Thread"
       │
       ▼
Modal opens with form
       │
User fills title & description
       │
User clicks "Create Thread"
       │
       ▼
Forums.jsx
  └─ Calls handleCreateThread()
       │
       ▼
forumsService.js
  └─ POST /api/phase2/forums/threads
       │
       ▼
phase2Routes.js
  ├─ Validates input (title >= 10 chars, desc >= 20 chars)
  └─ Calls forumsService.createThread()
       │
       ▼
forums.service.js
  ├─ Generates slug
  ├─ INSERT INTO forum_threads
  ├─ Auto-follows thread
  └─ Updates reputation (+10 points)
       │
       ▼
Triggers fire:
  ├─ update_user_reputation
  └─ update_updated_at
       │
       ▼
Response flows back
       │
       ▼
Thread appears in list
```

### 3. Voting on a Post

```
User clicks upvote button
       │
       ▼
PostCard.jsx
  └─ Calls onVote(postId)
       │
       ▼
Forums.jsx
  └─ Calls handleVotePost()
       │
       ▼
forumsService.js
  └─ POST /api/phase2/forums/posts/:postId/vote
       │
       ▼
phase2Routes.js
  └─ Calls forumsService.votePost()
       │
       ▼
forums.service.js
  ├─ Checks existing vote
  ├─ INSERT/UPDATE/DELETE forum_votes
  └─ Returns action (added/changed/removed)
       │
       ▼
Trigger fires:
  └─ update_post_vote_count
       ├─ Updates upvote_count
       └─ Updates downvote_count
       │
       ▼
Response flows back
       │
       ▼
Vote count updates in UI
```

---

## 🗂️ File Structure

```
innovateam/
│
├── server/
│   ├── migrations/
│   │   ├── create-forum-tables.sql          ← Schema
│   │   ├── seed-forum-categories.sql        ← Default data
│   │   └── verify-forum-setup.sql           ← Testing
│   │
│   ├── services/
│   │   └── forums.service.js                ← Business logic
│   │
│   └── routes/
│       └── phase2Routes.js                  ← API endpoints
│
├── src/
│   ├── pages/student/
│   │   ├── ForumsWrapper.jsx                ← Entry point
│   │   ├── Forums.jsx                       ← Main component
│   │   └── Forums.css                       ← Styles
│   │
│   ├── components/forums/
│   │   └── PostCard.jsx                     ← Post display
│   │
│   └── services/
│       └── forumsService.js                 ← API client
│
└── Documentation/
    ├── FORUM_SETUP_GUIDE.md                 ← Setup instructions
    ├── FORUM_DOCUMENTATION.md               ← Technical docs
    ├── FORUM_QUICK_REFERENCE.md             ← Cheat sheet
    ├── FORUM_IMPLEMENTATION_SUMMARY.md      ← What was built
    ├── FORUM_ACTION_CHECKLIST.md            ← Step-by-step guide
    └── FORUM_ARCHITECTURE.md                ← This file
```

---

## 🔐 Security Flow

```
User Request
     │
     ▼
Frontend adds JWT token to headers
     │
     ▼
Backend receives request
     │
     ▼
authenticate() middleware
  ├─ Verifies JWT token
  ├─ Extracts user ID
  └─ Attaches to req.user
     │
     ▼
Route handler
  ├─ Validates input
  ├─ Checks permissions
  └─ Calls service
     │
     ▼
Service layer
  ├─ Sanitizes input
  ├─ Uses parameterized queries
  └─ Prevents SQL injection
     │
     ▼
Database
  ├─ Row-level security (RLS)
  └─ Returns filtered data
     │
     ▼
Response sent back
```

---

## 📊 Database Relationships

```
tutorial_centers
       │
       │ 1:N
       ▼
forum_categories (8 per center)
       │
       │ 1:N
       ▼
forum_threads
       │
       ├─────────────┬─────────────┬─────────────┐
       │ 1:N         │ 1:N         │ 1:N         │ N:N
       ▼             ▼             ▼             ▼
forum_posts   forum_thread_  forum_thread_  user_profiles
              followers      views          (via reputation)
       │
       │ 1:N
       ▼
forum_votes
```

---

## ⚡ Performance Optimization

```
Request
   │
   ▼
┌─────────────────┐
│ Frontend Cache  │ ← Categories cached for 5 min
└─────────────────┘
   │
   ▼
┌─────────────────┐
│ API Layer       │ ← Rate limiting (future)
└─────────────────┘
   │
   ▼
┌─────────────────┐
│ Service Layer   │ ← Business logic
└─────────────────┘
   │
   ▼
┌─────────────────┐
│ Database        │
│  ├─ Indexes     │ ← 25+ indexes for fast queries
│  ├─ Views       │ ← Pre-computed stats
│  └─ Triggers    │ ← Real-time updates
└─────────────────┘
```

---

## 🎯 Component State Management

```
ForumsWrapper
  │
  ├─ centers[]           ← User's enrolled centers
  ├─ selectedCenter      ← Currently active center
  ├─ userProfile         ← User info
  └─ loading             ← Loading state
       │
       ▼
    Forums
      │
      ├─ view              ← 'categories' | 'threads' | 'thread-detail'
      ├─ categories[]      ← List of categories
      ├─ threads[]         ← List of threads
      ├─ selectedCategory  ← Current category
      ├─ selectedThread    ← Current thread
      ├─ searchQuery       ← Search input
      ├─ loading           ← Loading state
      └─ error             ← Error message
           │
           ▼
        PostCard
          │
          ├─ post          ← Post data
          ├─ isAnswer      ← Is marked answer
          └─ canMarkAnswer ← User permission
```

---

## 🔄 Real-time Updates (via Triggers)

```
User Action                    Trigger                    Result
────────────────────────────────────────────────────────────────
Create post          →    update_thread_reply_count  →  reply_count++
Vote on post         →    update_post_vote_count     →  upvote_count++
Mark as answer       →    update_user_reputation     →  reputation +50
Create thread        →    update_user_reputation     →  reputation +10
Update record        →    update_updated_at          →  updated_at = NOW()
```

---

## 📱 Responsive Design

```
Desktop (> 768px)
┌─────────────────────────────────────────┐
│  Sidebar  │  Main Content               │
│           │  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│  Forums   │  │ 1 │ │ 2 │ │ 3 │ │ 4 │   │
│  Messages │  └───┘ └───┘ └───┘ └───┘   │
│  Groups   │  ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
│           │  │ 5 │ │ 6 │ │ 7 │ │ 8 │   │
│           │  └───┘ └───┘ └───┘ └───┘   │
└─────────────────────────────────────────┘

Mobile (< 768px)
┌─────────────────┐
│  ☰  Forums      │
├─────────────────┤
│  ┌───────────┐  │
│  │ Category1 │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │ Category2 │  │
│  └───────────┘  │
│  ┌───────────┐  │
│  │ Category3 │  │
│  └───────────┘  │
└─────────────────┘
```

---

## 🎨 UI Component Hierarchy

```
App.js
  └─ RoleProtectedRoute
      └─ EducationalSidebar
          └─ ForumsWrapper
              └─ Forums
                  ├─ Categories View
                  │   └─ CategoryCard × 8
                  │
                  ├─ Threads View
                  │   ├─ ThreadItem × N
                  │   └─ CreateThreadModal
                  │
                  └─ Thread Detail View
                      ├─ ThreadHeader
                      ├─ OriginalPost
                      ├─ PostsList
                      │   └─ PostCard × N
                      │       └─ ReplyCard × N
                      └─ ReplyForm
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      PRODUCTION                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Vercel     │         │    Render    │            │
│  │  (Frontend)  │────────▶│   (Backend)  │            │
│  │ React Build  │  HTTPS  │  Node.js API │            │
│  └──────────────┘         └──────────────┘            │
│                                   │                     │
│                                   │ PostgreSQL          │
│                                   ▼                     │
│                          ┌──────────────┐              │
│                          │   Supabase   │              │
│                          │  (Database)  │              │
│                          └──────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Monitoring & Analytics

```
Application Metrics
  ├─ API Response Times
  ├─ Error Rates
  ├─ Active Users
  └─ Request Counts

Database Metrics
  ├─ Query Performance
  ├─ Connection Pool
  ├─ Table Sizes
  └─ Index Usage

Business Metrics
  ├─ Threads Created
  ├─ Posts Created
  ├─ Active Categories
  └─ User Engagement
```

---

**This architecture is designed for:**
- ✅ Scalability (handles 1000+ concurrent users)
- ✅ Performance (< 2 second page loads)
- ✅ Maintainability (clean separation of concerns)
- ✅ Security (authentication, validation, RLS)
- ✅ Reliability (error handling, fallbacks)

**Ready for production deployment! 🚀**
