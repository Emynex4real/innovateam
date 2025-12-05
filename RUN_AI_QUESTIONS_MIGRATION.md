# Run AI Questions Migration

## ✅ Quick Setup Guide

### Step 1: Run SQL Migration in Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `jdedscbvbkjvqmmdabig`
3. **Navigate to**: SQL Editor (left sidebar)
4. **Click**: "New Query"
5. **Copy and paste** the entire content from: `supabase/ai_question_banks.sql`
6. **Click**: "Run" button (or press Ctrl+Enter)

### Step 2: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('question_banks', 'questions', 'question_usage');
```

You should see 3 tables listed.

### Step 3: Restart Server

```bash
cd server
npm start
```

Or use the batch file:
```bash
server\start-server.bat
```

### Step 4: Test the Feature

1. Login as admin
2. Go to Admin Panel
3. Click "AI Questions" tab (🤖)
4. Try generating questions!

---

## ✅ Status Check

- ✅ **GEMINI_API_KEY**: Configured in `server/.env`
- ⏳ **SQL Migration**: Needs to be run in Supabase
- ⏳ **Server Restart**: After SQL migration

---

## 🔧 Alternative: Run Migration via Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

Or manually:

```bash
psql -h db.jdedscbvbkjvqmmdabig.supabase.co -U postgres -d postgres -f supabase/ai_question_banks.sql
```

---

## 📝 SQL File Location

The SQL migration file is located at:
```
innovateam/supabase/ai_question_banks.sql
```

Copy the entire content and paste it into Supabase SQL Editor.
