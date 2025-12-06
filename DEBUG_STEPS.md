# 🔍 DEBUG STEPS - Question Bank Not Showing

## Step 1: Run Emergency Fix

1. Open Supabase SQL Editor
2. Run: `EMERGENCY_FIX.sql`
3. Check the output - should show your role as 'admin'

## Step 2: Check Browser Console

After running the fix:
1. Go to Admin → AI Questions
2. Open browser console (F12)
3. Click "Run Diagnostic"
4. **COPY AND PASTE THE ENTIRE CONSOLE OUTPUT HERE**

## Step 3: Check Network Tab

1. Open DevTools (F12)
2. Go to "Network" tab
3. Click "Banks" tab in admin page
4. Look for request to `/api/admin/ai-questions/banks`
5. Click on it
6. Check:
   - **Status**: Should be 200
   - **Response**: What does it say?
   - **Headers**: Is Authorization header present?

## Step 4: Check Backend Logs

In your server terminal, you should see:
```
✅ User authenticated: emynex4real@gmail.com Role: admin IsAdmin: true
```

If you see:
```
❌ Token verification failed
```
→ Logout and login again

## Step 5: Test Direct Database Access

Run this in Supabase SQL Editor:
```sql
-- Check if you can see data directly
SELECT * FROM question_banks;
SELECT * FROM questions;

-- Check your user
SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'emynex4real@gmail.com';
```

## Step 6: Generate Test Questions

1. Go to "Generate" tab
2. Paste this text:
```
The mitochondria is the powerhouse of the cell. It produces ATP through cellular respiration.
```
3. Fill in:
   - Bank Name: "Test Biology"
   - Subject: "Biology"
   - Question Count: 3
4. Click "Generate Questions"

**What happens?**
- [ ] Success message?
- [ ] Error message? (copy it)
- [ ] Nothing?

## Step 7: Check Server Environment

Make sure `server/.env` has:
```env
GEMINI_API_KEY=your_key_here
SUPABASE_URL=your_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## Common Issues & Quick Fixes

### Issue 1: "No question banks yet"
**Cause**: No data in database
**Fix**: Generate questions first (Step 6)

### Issue 2: Diagnostic shows "User is NOT admin"
**Cause**: SQL didn't update role
**Fix**: 
```sql
-- Force update
UPDATE auth.users 
SET raw_user_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'emynex4real@gmail.com';
```
Then logout and login

### Issue 3: "Failed to load question banks"
**Cause**: API error or RLS blocking
**Fix**: Run EMERGENCY_FIX.sql (disables RLS)

### Issue 4: Generate button doesn't work
**Cause**: Missing GEMINI_API_KEY
**Fix**: Add key to server/.env

### Issue 5: 401 Unauthorized
**Cause**: Token expired
**Fix**: Logout and login again

### Issue 6: 403 Forbidden
**Cause**: Not admin
**Fix**: Run SQL to make admin, then logout/login

## What to Share

If still not working, share:

1. ✅ Console output from diagnostic
2. ✅ Network tab screenshot (showing the failed request)
3. ✅ Server logs (from terminal)
4. ✅ Result of Step 5 SQL queries
5. ✅ What happens when you try to generate questions

---

**Next**: Run EMERGENCY_FIX.sql and share the diagnostic output
