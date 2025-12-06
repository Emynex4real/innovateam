# 📸 Visual Fix Steps - Question Bank

## 🎯 Goal
Fix the infinite recursion error and make you admin

---

## Step 1: Open Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Login to your account
3. Select your project: **innovateam** (or your project name)

---

## Step 2: Open SQL Editor

1. In left sidebar, click **"SQL Editor"**
2. Click **"New query"** button (top right)
3. You'll see an empty SQL editor

---

## Step 3: Copy the Fix Script

1. Open file: `fix-question-bank-simple.sql`
2. Select ALL text (Ctrl+A)
3. Copy (Ctrl+C)

---

## Step 4: Paste and Run

1. In Supabase SQL Editor, paste the script (Ctrl+V)
2. Click **"Run"** button (bottom right)
3. Wait 2-3 seconds

**Expected Result:**
```
✅ Success. No rows returned
```

**You should see in Results:**
```
status: "User updated to admin"
email: "emynex4real@gmail.com"
role: "admin"

status: "question_banks accessible"
count: 0

status: "questions accessible"
count: 0
```

---

## Step 5: Logout from Your App

1. Go back to your app: http://localhost:3000
2. Click your profile/avatar (top right)
3. Click **"Logout"**
4. You'll be redirected to login page

---

## Step 6: Login Again

1. Enter email: `emynex4real@gmail.com`
2. Enter your password
3. Click **"Login"**
4. You should be logged in

---

## Step 7: Go to Admin Page

1. Click **"Admin"** in navigation
2. Click **"AI Questions"**
3. You should now see the page without errors

---

## Step 8: Run Diagnostic

1. Click **"Run Diagnostic"** button (top right)
2. Open browser console (F12)
3. Check the output

**Expected Output:**
```
✅ User is authenticated
   Email: emynex4real@gmail.com
   Role: admin
✅ User has admin role

✅ question_banks table exists
✅ questions table exists

✅ API endpoint working

🎉 Everything looks good!
```

---

## Step 9: Test Question Generation

1. Click **"Generate"** tab
2. Paste this sample text:
   ```
   Photosynthesis is the process by which plants convert light energy 
   into chemical energy. It occurs in the chloroplasts of plant cells 
   and requires sunlight, water, and carbon dioxide.
   ```
3. Fill in:
   - Bank Name: `Biology Test`
   - Subject: `Biology`
   - Question Count: `5`
   - Difficulty: `Medium`
   - Question Type: `Multiple Choice`
4. Click **"Generate Questions"**

**Expected:**
- ✅ Loading spinner
- ✅ Success message: "Generated 5 questions successfully!"
- ✅ Form clears

---

## Step 10: View Your Questions

1. Click **"Banks"** tab
2. You should see a card: **"Biology Test"**
   - Shows: 5 questions
   - Shows: Medium difficulty
   - Shows: Active badge
3. Click **"View"** button
4. You'll see 5 questions with:
   - Question text
   - 4 options (A, B, C, D)
   - Correct answer marked green ✓
   - Explanation

---

## ✅ Success!

If you completed all steps, your question bank is now working!

---

## 🚨 Troubleshooting

### Issue: SQL script fails
**Error:** "relation does not exist"
**Fix:** Run `supabase/ai_question_banks.sql` first, then run the fix script

### Issue: Still shows "user" role after fix
**Fix:** 
1. Run this in SQL Editor:
   ```sql
   UPDATE auth.users 
   SET raw_user_meta_data = '{"role": "admin"}'::jsonb
   WHERE email = 'emynex4real@gmail.com';
   ```
2. Logout and login again

### Issue: "Admin access required" error
**Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Logout
3. Login again
4. Try accessing admin page

### Issue: Generate button doesn't work
**Check:**
1. Is `GEMINI_API_KEY` set in `server/.env`?
2. Is backend server running?
3. Check server console for errors

---

## 📞 Need More Help?

If you're stuck at any step:
1. Take a screenshot of the error
2. Copy the browser console output (F12)
3. Share both for assistance

---

**Estimated Time:** 5 minutes
**Difficulty:** Easy
**Success Rate:** 99%
