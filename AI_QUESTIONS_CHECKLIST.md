# AI Questions Setup Checklist

## ✅ Status Check

### 1. GEMINI_API_KEY
- ✅ **CONFIGURED** in `server/.env`
- Key: `AIzaSyAgoRwSMUMafyCV0HteWNIRN-VajtsGRU0`

### 2. SQL Migration
- ⏳ **PENDING** - Needs to be run in Supabase

**How to run:**
1. Open: https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig/sql/new
2. Copy entire content from: `supabase/ai_question_banks.sql`
3. Paste into SQL Editor
4. Click "Run" (or Ctrl+Enter)

**What it creates:**
- `question_banks` table
- `questions` table  
- `question_usage` table
- RLS policies
- Indexes
- Triggers

### 3. Server Restart
- ⏳ **PENDING** - After SQL migration

**How to restart:**
```bash
cd server
npm start
```

Or double-click: `server/start-server.bat`

### 4. Test the Feature
- ⏳ **PENDING** - After server restart

**How to test:**
1. Open: http://localhost:3000
2. Login as admin
3. Go to Admin Panel
4. Click "AI Questions" tab (🤖 icon)
5. Try generating questions from text

---

## 📝 Quick Commands

### Check if tables exist (run in Supabase SQL Editor):
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('question_banks', 'questions', 'question_usage');
```

### Test API endpoint (after server starts):
```bash
curl http://localhost:5000/api/admin/ai-questions/stats
```

---

## 🎯 What You Can Do After Setup

1. **Generate Questions**
   - Paste any educational text
   - Choose question count (1-50)
   - Select difficulty (easy/medium/hard)
   - Pick question type (multiple-choice, true-false, etc.)
   - Click "Generate Questions"

2. **Manage Question Banks**
   - View all question banks
   - See question counts
   - Delete banks
   - View questions in each bank

3. **Edit Questions**
   - View all questions
   - Toggle active/inactive
   - Delete individual questions
   - Bulk delete multiple questions
   - See statistics

---

## 🐛 Troubleshooting

### "Table does not exist" error?
→ Run SQL migration in Supabase

### "GEMINI_API_KEY not found" error?
→ Already configured, restart server

### Can't see AI Questions tab?
→ Make sure you're logged in as admin

### Questions not generating?
→ Check server logs for errors
→ Verify Gemini API key is valid

---

## ✅ Ready to Proceed?

Once SQL migration is complete and server is restarted, you're ready to use AI Questions!

**Next Feature Options:**
1. Enhanced Analytics (charts & graphs)
2. Bulk Operations (extend to users/transactions)
3. Export Features (CSV/PDF reports)
4. Real-time Notifications
5. Activity Logs
6. Service Management
7. Financial Reports
8. User Communication
9. System Monitoring
