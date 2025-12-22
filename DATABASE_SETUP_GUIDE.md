# 📊 Database Setup Guide

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Access Supabase SQL Editor**
1. Go to [supabase.com](https://supabase.com)
2. Login to your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### **Step 2: Run the Setup Script**
1. Open the file: `database_setup.sql`
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Wait for "Success. No rows returned" message

### **Step 3: Verify Tables Created**
1. Click **Table Editor** in the left sidebar
2. You should see all these tables:
   - ✅ conversations
   - ✅ messages
   - ✅ forum_categories
   - ✅ forum_threads
   - ✅ forum_posts
   - ✅ forum_votes
   - ✅ study_groups
   - ✅ study_group_members
   - ✅ study_group_posts
   - ✅ tutor_profiles
   - ✅ tutor_subjects
   - ✅ tutoring_requests
   - ✅ tutoring_sessions
   - ✅ tutor_reviews
   - ✅ notifications
   - ✅ badges
   - ✅ user_badges
   - ✅ user_points
   - ✅ point_transactions

## 🔧 What the Script Does

### **Creates 19 Tables**
- **Messaging**: conversations, messages
- **Forums**: forum_categories, forum_threads, forum_posts, forum_votes
- **Study Groups**: study_groups, study_group_members, study_group_posts
- **Tutoring**: tutor_profiles, tutor_subjects, tutoring_requests, tutoring_sessions, tutor_reviews
- **Gamification**: badges, user_badges, user_points, point_transactions
- **System**: notifications

### **Adds Performance Indexes**
- Optimizes queries for conversations, messages, forums, study groups
- Speeds up user lookups and notifications

### **Enables Security (RLS)**
- Row Level Security ensures users only see their own data
- Basic policies for conversations, messages, and notifications

### **Inserts Sample Badges**
- First Message (10 points)
- Forum Contributor (25 points)
- Study Group Leader (50 points)
- Helpful Tutor (100 points)

## ✅ Testing the Setup

### **Test 1: Check Tables Exist**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### **Test 2: Check Sample Badges**
```sql
SELECT * FROM badges;
```

### **Test 3: Verify Indexes**
```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

## 🔐 Security Notes

- **RLS is enabled** on all tables
- Users can only access their own conversations and messages
- Additional policies may be needed for forums and study groups
- Admin users may need special policies

## 🐛 Troubleshooting

### **Error: "relation already exists"**
- Tables already created, skip or drop them first
- Run: `DROP TABLE IF EXISTS table_name CASCADE;`

### **Error: "permission denied"**
- Make sure you're logged in as project owner
- Check your Supabase project permissions

### **Error: "foreign key constraint"**
- Make sure `auth.users` table exists
- Check that `user_profiles` table is set up

## 🎯 Next Steps

1. ✅ Run the SQL script
2. ✅ Verify tables in Table Editor
3. ✅ Test the frontend features
4. ✅ Add custom RLS policies if needed
5. ✅ Monitor database performance

Your database is now ready for the messaging, forums, study groups, and tutoring features! 🚀