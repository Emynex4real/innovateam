# Fix Redirect Issue - Quick Guide

## Problem
- When logging in as tutor (emynex4real@gmail.com), you're being redirected to admin dashboard
- When accessing /tutor, you're being redirected to /admin/dashboard

## Root Cause
Your account has role 'tutor' in the database, but the system is treating it as admin somewhere.

## Solution: Choose ONE

### Option 1: Make Account Admin (Recommended if you need admin access)

Run this SQL in Supabase SQL Editor:

```sql
-- Change to admin role
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'emynex4real@gmail.com';

UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'emynex4real@gmail.com');
```

Then:
1. Log out
2. Clear browser cache (Ctrl+Shift+Delete)
3. Log back in
4. You'll be redirected to /admin/dashboard ✅

### Option 2: Keep as Tutor (If you want tutor access)

Run this SQL to verify role is 'tutor':

```sql
SELECT 
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    up.role as profile_role
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.id = au.id
WHERE au.email = 'emynex4real@gmail.com';
```

If both show 'tutor', then:
1. Log out completely
2. Clear localStorage: Open browser console (F12) and run:
   ```javascript
   localStorage.clear();
   ```
3. Close all browser tabs
4. Log back in
5. You should be redirected to /tutor ✅

## Quick Test

After applying either solution:

1. Open browser console (F12)
2. Log in
3. Check console logs for:
   - "✅ User role from DB: [role]"
   - "Allowed roles: [...]"
   - "✅ Access granted" or "🚫 Access denied"

This will show you exactly what's happening.

## Current Database State

Based on your screenshot:
- `user_profiles` table shows: **role = 'tutor'**
- This means Option 1 (change to admin) is needed if you want admin access

## Files Created
- `MAKE_ADMIN.sql` - SQL to change role to admin
- `REDIRECT_FIX_GUIDE.md` - This guide
