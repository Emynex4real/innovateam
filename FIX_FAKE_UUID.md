# Fix for Fake UUID Error

## Problem
Users getting error: `invalid input syntax for type uuid: "confirmed-1764846166582"`

This happens because the email confirmation page creates fake user IDs instead of using real Supabase UUIDs.

## Solution

### 1. Enable Supabase Email Confirmation
Go to Supabase Dashboard → Authentication → Email Templates → Enable "Confirm signup"

### 2. Disable Email Confirmation Requirement (Temporary Fix)
Go to Supabase Dashboard → Authentication → Settings → Disable "Enable email confirmations"

This allows users to login immediately after signup without email confirmation.

### 3. Clean Up Fake Users
Run this in browser console for affected users:
```javascript
localStorage.removeItem('confirmedUser');
```
Then have them register again.

### 4. Database Fix
Run this SQL in Supabase to check for users with fake IDs:
```sql
-- Check auth.users table
SELECT id, email, created_at FROM auth.users;

-- If user exists in auth.users, update user_profiles
UPDATE user_profiles 
SET id = (SELECT id FROM auth.users WHERE email = 'michaelbalogun34@gmail.com')
WHERE email = 'michaelbalogun34@gmail.com';
```

## Quick Fix for Current User

The user `michaelbalogun34@gmail.com` needs to:
1. Log out completely
2. Clear browser data
3. Register again (will get real UUID from Supabase)
4. Wallet will work properly

## Code Already Fixed
- ✅ App.js now stores real Supabase user ID on signup
- ✅ No more fake "confirmed-" IDs being created
