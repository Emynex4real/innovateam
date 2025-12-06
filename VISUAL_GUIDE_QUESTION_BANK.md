# Visual Guide: Fixing Question Bank

## 🎯 Goal
Get the Question Bank feature working in the admin page.

---

## 📋 Step-by-Step Visual Guide

### Step 1: Open Admin Page
```
Browser → Login → Admin Dashboard → AI Questions
```
**What you should see:**
- ✅ Three tabs: Generate | Banks | Questions
- ✅ "Run Diagnostic" button (top right)
- ✅ No error messages

**If you see errors:**
- ❌ "Authentication required" → Go to Step 2
- ❌ "Admin access required" → Go to Step 3
- ❌ Blank page → Go to Step 4

---

### Step 2: Check Authentication
```
Browser Console (F12) → Console Tab
```

**Look for:**
```
✅ User authenticated: your-email@example.com
✅ Role: admin
```

**If you see:**
```
❌ No active session
❌ Token expired
```

**Fix:**
1. Click Logout
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again
4. Go back to Admin → AI Questions

---

### Step 3: Verify Admin Role

**Option A: Use Diagnostic Tool**
```
Admin Page → Click "Run Diagnostic" → Check Console
```

**Option B: Check Database**
```sql
-- In Supabase SQL Editor
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

**If role is NOT 'admin':**
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

**Then:**
1. Logout
2. Login again
3. Try accessing AI Questions

---

### Step 4: Check Database Tables

**Run Test Script:**
```bash
# Windows
test-question-bank.bat

# Or manually
node test-question-banks.js
```

**Expected Output:**
```
✅ question_banks table exists
✅ questions table exists
   Question Banks: 0
   Questions: 0
```

**If you see errors:**
```
❌ question_banks table error
❌ questions table error
```

**Fix:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Open file: `supabase/ai_question_banks.sql`
4. Click "Run"
5. Wait for success message
6. Run test script again

---

### Step 5: Test Question Generation

**In Admin Page:**

1. **Go to "Generate" Tab**
   ```
   Click: Generate (first tab)
   ```

2. **Fill Form:**
   ```
   Text Content: [Paste any educational text, min 10 chars]
   Bank Name: "Test Bank"
   Subject: "General"
   Question Count: 5
   Difficulty: Medium
   Question Type: Multiple Choice
   ```

3. **Click "Generate Questions"**
   
   **Expected:**
   ```
   ✅ Loading indicator
   ✅ Success message: "Generated 5 questions successfully!"
   ✅ Form clears
   ```

   **If error:**
   ```
   ❌ Check console for error message
   ❌ Verify GEMINI_API_KEY in server/.env
   ```

4. **Go to "Banks" Tab**
   ```
   Click: Banks (second tab)
   ```

   **Expected:**
   ```
   ✅ See "Test Bank" card
   ✅ Shows: 5 questions
   ✅ Shows: Medium difficulty
   ✅ Shows: Active badge
   ```

5. **Click "View" on Bank**
   
   **Expected:**
   ```
   ✅ Switches to Questions tab
   ✅ Shows 5 questions
   ✅ Each question has:
      - Question text
      - Options (A, B, C, D)
      - Correct answer (green checkmark)
      - Explanation
   ```

---

## 🔍 Diagnostic Tool Guide

### Using the Diagnostic Button

1. **Click "Run Diagnostic"** (top right of AI Questions page)

2. **Open Console** (F12 → Console tab)

3. **Read Results:**

```
🔍 Question Bank Diagnostic Tool
================================

1️⃣ Checking Authentication...
✅ User is authenticated
   Email: your-email@example.com
   Role: admin
✅ User has admin role

2️⃣ Checking Database Tables...
✅ question_banks table exists
✅ questions table exists

3️⃣ Checking Data...
   Question Banks: 0
   Questions: 0
ℹ️ No data yet (this is normal for new setup)

4️⃣ Testing API Endpoint...
   Status: 200 OK
✅ API endpoint working
   Banks returned: 0

📊 Diagnostic Summary
================================
Authentication: ✅
Admin Role: ✅
Database Tables: ✅
Has Data: ℹ️ Empty
API Working: ✅

🎉 Everything looks good!
💡 Tip: Generate some questions to get started
```

---

## 🚨 Common Error Messages

### Error 1: "Authentication required"
```
❌ Status: 401 Unauthorized
```
**Fix:**
- Logout and login again
- Clear browser cache
- Check if token expired

### Error 2: "Admin access required"
```
❌ Status: 403 Forbidden
```
**Fix:**
- Update user role to 'admin' in database
- Logout and login again

### Error 3: "Failed to load question banks"
```
❌ Network error or 500 Server Error
```
**Fix:**
- Check if backend server is running
- Check server logs for errors
- Verify database tables exist

### Error 4: Empty page / No tabs
```
❌ Component not rendering
```
**Fix:**
- Check browser console for React errors
- Verify route is correct: /admin/ai-questions
- Check if user is authenticated

### Error 5: "Table does not exist"
```
❌ relation "question_banks" does not exist
```
**Fix:**
- Run `supabase/ai_question_banks.sql` in Supabase
- Verify tables created with test script

---

## ✅ Success Checklist

After following all steps, you should have:

- [x] User logged in as admin
- [x] Can access Admin → AI Questions
- [x] See three tabs: Generate, Banks, Questions
- [x] Diagnostic shows all green ✅
- [x] Can generate questions
- [x] Questions appear in Banks tab
- [x] Can view questions
- [x] Can delete questions/banks
- [x] Stats cards show correct counts
- [x] No console errors

---

## 📞 Still Need Help?

If you've followed all steps and it's still not working:

1. **Run Diagnostic** and screenshot the console output
2. **Check Network Tab** (F12 → Network) and screenshot any red/failed requests
3. **Run Test Script** and copy the output
4. **Check Server Logs** and copy any error messages

Share these 4 items for further assistance.

---

## 🎓 Understanding the Flow

```
User Action → Frontend → API → Backend → Database
     ↓           ↓        ↓       ↓          ↓
  Click      React    HTTP    Express   Supabase
  Button     Component Request  Route    Tables
```

**Diagnostic checks each layer:**
1. ✅ User authenticated? (Frontend)
2. ✅ Admin role? (Frontend + Backend)
3. ✅ Tables exist? (Database)
4. ✅ API working? (Backend)
5. ✅ Data present? (Database)

---

**Last Updated**: 2025
**Difficulty**: Easy
**Time Required**: 5-10 minutes
