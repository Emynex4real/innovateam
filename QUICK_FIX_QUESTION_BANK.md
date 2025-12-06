# Quick Fix: Question Bank Not Working

## 🚀 Quick Steps

### 1. Run Diagnostic (Easiest)
1. Open the admin page → AI Questions
2. Click "Run Diagnostic" button (top right)
3. Check browser console (F12) for detailed results
4. Follow the solutions shown

### 2. Check Database Tables
```bash
# From project root
node test-question-banks.js
```

If tables don't exist:
- Go to Supabase Dashboard
- SQL Editor
- Open and run: `supabase/ai_question_banks.sql`

### 3. Verify Admin Role
```sql
-- In Supabase SQL Editor
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'YOUR_EMAIL@example.com';
```

### 4. Restart Everything
```bash
# Stop both servers (Ctrl+C)

# Start backend
cd server
npm start

# Start frontend (new terminal)
cd client  # or just from root if using root package.json
npm start
```

### 5. Clear Cache & Login Again
1. Open DevTools (F12)
2. Application tab → Clear storage
3. Logout from app
4. Login again
5. Go to Admin → AI Questions

## 🔍 Common Error Messages

| Error | Solution |
|-------|----------|
| "Authentication required" | Login again |
| "Admin access required" | Update role in database (Step 3) |
| "Failed to load question banks" | Run diagnostic, check console |
| Empty page / No data | Normal if no banks created yet |
| CORS error | Check server is running on port 5000 |

## ✅ What Should Work

After fixes:
- ✅ See 3 tabs: Generate, Banks, Questions
- ✅ Generate tab shows form to create questions
- ✅ Banks tab shows list of question banks (empty if none created)
- ✅ Questions tab shows questions from selected bank
- ✅ Stats cards show counts
- ✅ No errors in console

## 📝 Test It

1. Go to "Generate" tab
2. Paste some text (minimum 10 characters)
3. Fill in Bank Name and Subject
4. Click "Generate Questions"
5. Should see success message
6. Go to "Banks" tab
7. Should see your new bank
8. Click "View" to see questions

## 🆘 Still Not Working?

Check the detailed guide: `QUESTION_BANK_FIX.md`

Or provide these details:
1. Screenshot of browser console errors
2. Screenshot of Network tab (F12 → Network)
3. Output of `node test-question-banks.js`
4. Result of "Run Diagnostic" button
