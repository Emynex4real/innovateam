# Quick Fix: Restore Admin Access for emynex4real@gmail.com

## The Problem
Your account was changed from admin to tutor, but the system checks roles in two places that got out of sync.

## The Solution (Choose ONE method)

### Method 1: SQL Script (RECOMMENDED - Fastest)

1. Go to your Supabase Dashboard
2. Click on "SQL Editor"
3. Copy and paste the contents of `fix-admin-direct.sql`
4. Click "Run"
5. Log out and log back in

### Method 2: Node.js Script

```bash
node fix-admin-improved.js
```

If it shows SQL commands, copy them and run in Supabase SQL Editor.

### Method 3: Manual SQL (If above don't work)

Run this in Supabase SQL Editor:

```sql
-- Update auth metadata
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'emynex4real@gmail.com';

-- Disable trigger temporarily
ALTER TABLE public.users DISABLE TRIGGER update_users_updated_at;

-- Update users table
UPDATE public.users
SET role = 'admin'
WHERE email = 'emynex4real@gmail.com';

-- Re-enable trigger
ALTER TABLE public.users ENABLE TRIGGER update_users_updated_at;
```

## After Running the Fix

1. **Log out** completely
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Log back in** with emynex4real@gmail.com
4. Navigate to `/admin` - you should now have access!

## What Was Fixed in the Code

✅ Frontend now checks the correct `users` table (not `user_profiles`)
✅ Backend checks database role first (source of truth)
✅ Admin panel role changes now sync both locations
✅ Added support for 'tutor' role

## Files Changed

- `src/components/AdminProtectedRoute.jsx` - Fixed table name
- `server/middleware/authenticate.js` - Added database role check
- `server/routes/admin.routes.js` - Added role sync logic

## Need Help?

Check `ADMIN_ACCESS_FIX.md` for detailed documentation.
