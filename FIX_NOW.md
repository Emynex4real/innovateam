# 🚨 URGENT FIX - Question Bank

## Problem Found
1. ❌ User is not admin
2. ❌ Infinite recursion in RLS policies (main issue)

## Quick Fix (2 minutes)

### Step 1: Run SQL Fix
1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste this entire file: `fix-question-bank-simple.sql`
4. Click **Run**
5. Wait for "Success" message

### Step 2: Logout & Login
1. In your app, click **Logout**
2. **Login** again with: `emynex4real@gmail.com`
3. Go to **Admin** → **AI Questions**

### Step 3: Test
1. Click **"Run Diagnostic"** button
2. Should now show:
   ```
   ✅ User is authenticated
   ✅ User has admin role
   ✅ question_banks table exists
   ✅ questions table exists
   ✅ API endpoint working
   ```

## What the Fix Does

The SQL script:
1. ✅ Makes your user an admin
2. ✅ Removes broken RLS policies
3. ✅ Creates simple policies that work
4. ✅ Allows authenticated users to access tables (backend checks admin)

## After Running the Fix

You should be able to:
- ✅ Access Admin → AI Questions
- ✅ See all three tabs
- ✅ Generate questions
- ✅ View question banks
- ✅ Manage questions

## If Still Not Working

Run this in Supabase SQL Editor:
```sql
-- Check your role
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'emynex4real@gmail.com';

-- Should show: role = 'admin'
```

If role is still 'user', run:
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'emynex4real@gmail.com';
```

Then logout and login again.

## Why This Happened

The original RLS policies tried to check the `users` table, which created an infinite loop:
```
question_banks policy → checks users table → users table policy → checks users table → ∞
```

The fix uses simple authentication checks instead:
```
question_banks policy → checks auth.uid() → ✅ done
```

Backend middleware still enforces admin-only access, so security is maintained.

---

**Time to fix**: 2 minutes
**Difficulty**: Easy
**Files to use**: `fix-question-bank-simple.sql`
