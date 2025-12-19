# 📊 PHASE 1: DATABASE SETUP GUIDE

## ✅ Step 1: Run SQL Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Paste Migration**
   - Open `supabase/tutorial_center_migration.sql`
   - Copy ALL the content
   - Paste into Supabase SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for success message

## ✅ Step 2: Verify Tables Created

Run this query to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'tc_%' OR table_name = 'tutorial_centers'
ORDER BY table_name;
```

You should see:
- ✅ tutorial_centers
- ✅ tc_questions
- ✅ tc_question_sets
- ✅ tc_question_set_items
- ✅ tc_enrollments
- ✅ tc_student_attempts

## ✅ Step 3: Test Access Code Generation

Run this to test:

```sql
INSERT INTO tutorial_centers (tutor_id, name, description)
VALUES (auth.uid(), 'Test Center', 'Testing access code generation');

SELECT name, access_code FROM tutorial_centers WHERE tutor_id = auth.uid();
```

You should see a 6-character access code generated automatically!

## ✅ Step 4: Clean Up Test Data

```sql
DELETE FROM tutorial_centers WHERE name = 'Test Center';
```

## 🎯 What We Created

### **Tables:**
1. **tutorial_centers** - One per tutor
2. **tc_questions** - Question bank
3. **tc_question_sets** - Tests/exams
4. **tc_question_set_items** - Links questions to tests
5. **tc_enrollments** - Students join centers
6. **tc_student_attempts** - Test results

### **Features:**
- ✅ Auto-generated 6-character access codes
- ✅ Automatic first-attempt tracking
- ✅ Row Level Security (RLS) policies
- ✅ Automatic timestamp updates
- ✅ Leaderboard view
- ✅ Center statistics view

### **Security:**
- ✅ Tutors can only see/edit their own data
- ✅ Students can only see enrolled centers
- ✅ Students can only submit their own attempts
- ✅ Tutors can view their students' results

## 🚀 Next Phase

Once database is set up, we'll move to:
- **Phase 2:** Backend API (Node.js routes & controllers)

---

**Status:** ⏳ Waiting for you to run the migration in Supabase

Let me know when done! ✅
