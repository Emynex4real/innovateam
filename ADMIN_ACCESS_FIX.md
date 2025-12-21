# Admin Access Fix - Complete Solution

## Problem Summary

The account `emynex4real@gmail.com` was previously an admin but lost admin access after being configured as a tutor. This happened because:

1. **Database Mismatch**: The system checks roles in two places:
   - `auth.users.user_metadata.role` (Supabase Auth)
   - `public.users.role` (Database table)

2. **Inconsistent Updates**: When the role was changed to 'tutor', only one location was updated, causing a mismatch.

3. **Wrong Table Reference**: The frontend was checking a non-existent `user_profiles` table instead of the correct `users` table.

## What Was Fixed

### 1. Frontend Fix (AdminProtectedRoute.jsx)
- **Before**: Checked `user_profiles` table (doesn't exist)
- **After**: Checks `users` table (correct table)

### 2. Backend Middleware Fix (authenticate.js)
- **Before**: Only checked `user_metadata.role` from Supabase Auth
- **After**: Checks `users.role` table first, then falls back to `user_metadata.role`

This ensures the database is the source of truth for roles.

### 3. Admin Routes Fix (admin.routes.js)
- **Before**: Only updated `user_metadata` when changing roles
- **After**: Updates BOTH `user_metadata` AND `users` table to keep them in sync
- **Bonus**: Now supports 'tutor' role in addition to 'admin', 'user', and 'student'

### 4. Database Schema Update
- Added SQL migration to support 'tutor' role in the `user_role` enum
- File: `supabase/add_tutor_role_fix.sql`

## How to Fix Your Account

### Option 1: Run the Fix Script (Recommended)

1. Open terminal in the project root directory
2. Run the fix script:
   ```bash
   node fix-admin-role.js
   ```

3. The script will:
   - Find your account by email
   - Update `user_metadata.role` to 'admin'
   - Update `users.role` to 'admin'
   - Verify the changes

4. Log out and log back in to see admin access restored

### Option 2: Manual Database Update

If you have access to Supabase dashboard:

1. Go to SQL Editor in Supabase
2. Run this query:
   ```sql
   -- Find your user ID
   SELECT id, email, raw_user_meta_data->>'role' as metadata_role
   FROM auth.users
   WHERE email = 'emynex4real@gmail.com';
   
   -- Update both locations (replace USER_ID with actual ID from above)
   -- Update auth metadata
   UPDATE auth.users
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'::jsonb),
     '{role}',
     '"admin"'
   )
   WHERE email = 'emynex4real@gmail.com';
   
   -- Update users table
   UPDATE public.users
   SET role = 'admin'
   WHERE email = 'emynex4real@gmail.com';
   
   -- Verify
   SELECT 
     au.email,
     au.raw_user_meta_data->>'role' as auth_role,
     u.role as table_role
   FROM auth.users au
   LEFT JOIN public.users u ON u.id = au.id
   WHERE au.email = 'emynex4real@gmail.com';
   ```

### Option 3: Use Admin API (If you have another admin account)

1. Log in with another admin account
2. Go to Admin Panel → User Management
3. Find `emynex4real@gmail.com`
4. Click "Make Admin"

The updated code will now sync both locations automatically.

## Database Schema Update

To support the 'tutor' role properly, run this SQL in Supabase:

```bash
# In Supabase SQL Editor, run:
supabase/add_tutor_role_fix.sql
```

Or manually:
```sql
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tutor';
```

## Role Hierarchy

The system now supports these roles:

1. **admin** - Full system access, can manage users, transactions, and settings
2. **tutor** - Can create and manage tutorial content, questions, and tests
3. **student** - Can access learning materials and take tests
4. **user** - Basic access (legacy role, same as student)

## Testing the Fix

After running the fix:

1. **Log out** completely from the application
2. **Clear browser cache** (optional but recommended)
3. **Log back in** with `emynex4real@gmail.com`
4. Try to access `/admin` route
5. You should now see the Admin Dashboard

## Prevention

To prevent this issue in the future:

1. **Always use the Admin Panel** to change user roles (it now syncs both locations)
2. **Don't manually edit** the database without updating both tables
3. **Use the API endpoint** `/api/admin/users/:id/role` which now handles sync automatically

## Technical Details

### Role Check Priority (New Behavior)

```javascript
// Priority order for role determination:
1. public.users.role (Database table) ← PRIMARY SOURCE
2. auth.users.user_metadata.role (Auth metadata) ← FALLBACK
3. 'user' (Default if neither exists)
```

### Files Modified

1. `src/components/AdminProtectedRoute.jsx` - Fixed table reference
2. `server/middleware/authenticate.js` - Added database role check
3. `server/routes/admin.routes.js` - Added role sync logic
4. `supabase/add_tutor_role_fix.sql` - Database schema update

### Files Created

1. `fix-admin-role.js` - Automated fix script
2. `ADMIN_ACCESS_FIX.md` - This documentation

## Troubleshooting

### Issue: Still can't access admin panel after fix

**Solution:**
1. Check browser console for errors
2. Verify you're logged out completely
3. Clear localStorage: `localStorage.clear()`
4. Log in again

### Issue: Script fails with "Missing Supabase credentials"

**Solution:**
1. Ensure `server/.env` file exists
2. Check it contains:
   ```
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

### Issue: "Invalid role" error when changing roles

**Solution:**
1. Run the database migration: `supabase/add_tutor_role_fix.sql`
2. This adds 'tutor' to the allowed roles

## Support

If you continue to have issues:

1. Check the server logs for detailed error messages
2. Verify your Supabase connection is working
3. Ensure RLS policies allow admin access
4. Contact the development team with:
   - Error messages from console
   - Your user email
   - Steps you've already tried

## Summary

✅ **Fixed**: Table reference in AdminProtectedRoute
✅ **Fixed**: Role checking logic in middleware  
✅ **Fixed**: Role update sync in admin routes
✅ **Added**: Support for 'tutor' role
✅ **Created**: Automated fix script
✅ **Created**: Database migration

Your admin access should now be fully restored! 🎉
