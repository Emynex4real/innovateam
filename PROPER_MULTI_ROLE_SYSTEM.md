# PROPER Multi-Role System - Standard Implementation

## Why Your Current System Has Issues

**Single role column** = User can only be ONE thing at a time
- ❌ Can't be admin AND tutor
- ❌ Requires hacky workarounds
- ❌ Not scalable

## The Standard Solution: Multi-Role Flags

### Step 1: Run Database Migration

```sql
-- In Supabase SQL Editor, run:
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_tutor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT TRUE;

-- Migrate existing data
UPDATE public.user_profiles
SET 
  is_admin = (role = 'admin'),
  is_tutor = (role = 'tutor'),
  is_student = (role = 'student' OR role = 'user');

-- Make yourself admin + tutor
UPDATE public.user_profiles
SET 
  is_admin = TRUE,
  is_tutor = TRUE,
  is_student = FALSE
WHERE email = 'emynex4real@gmail.com';
```

### Step 2: Files Already Updated

✅ `server/middleware/authenticate.js` - Now checks all role flags
✅ `src/pages/login/index.jsx` - All users go to /dashboard
✅ `src/pages/dashboard/index.jsx` - Dynamic tutorial center link
✅ `src/App.js` - Tutors and admins can access tutor routes

### Step 3: How It Works Now

**Database:**
```
user_profiles table:
- role: 'admin' (primary role, for backward compatibility)
- is_admin: TRUE
- is_tutor: TRUE
- is_student: FALSE
```

**Backend checks:**
```javascript
req.user = {
  isAdmin: true,   // Can access /admin routes
  isTutor: true,   // Can access /tutor routes
  isStudent: false // Cannot access /student routes
}
```

**Frontend routing:**
- Login → `/dashboard` (everyone)
- Tutorial Center button → `/tutor` (if admin/tutor) or `/student/centers` (if student)
- Admin can access both `/admin` and `/tutor`
- Regular tutors can only access `/tutor`

## Benefits of This Approach

✅ **Standard**: This is how most apps handle roles (Discord, Slack, etc.)
✅ **Flexible**: Users can have multiple roles
✅ **Scalable**: Easy to add new roles (is_moderator, is_premium, etc.)
✅ **No hacks**: Clean, straightforward logic
✅ **Future-proof**: Won't need refactoring later

## Usage Examples

### Create a regular tutor:
```sql
UPDATE user_profiles SET
  is_tutor = TRUE,
  is_admin = FALSE,
  role = 'tutor'
WHERE email = 'tutor@example.com';
```

### Create admin who is also a tutor:
```sql
UPDATE user_profiles SET
  is_admin = TRUE,
  is_tutor = TRUE,
  role = 'admin'
WHERE email = 'admin@example.com';
```

### Create a student:
```sql
UPDATE user_profiles SET
  is_student = TRUE,
  is_admin = FALSE,
  is_tutor = FALSE,
  role = 'student'
WHERE email = 'student@example.com';
```

## Testing

1. Run the SQL migration
2. Log out
3. Clear cache: `localStorage.clear()`
4. Log back in
5. Test:
   - ✅ Login goes to /dashboard
   - ✅ Can access /admin
   - ✅ Can access /tutor
   - ✅ Tutorial Center button works

## No More Issues

This is the **industry standard** approach. You won't have role conflicts anymore because:
- Each permission is independent
- No more "either/or" logic
- Clear, explicit checks
- Easy to debug

## Files Modified

1. `server/middleware/authenticate.js` - Multi-role support
2. `src/pages/login/index.jsx` - Universal dashboard redirect
3. `src/pages/dashboard/index.jsx` - Role-based tutorial link
4. `src/App.js` - Multi-role route access
5. `supabase/add_multi_role_support.sql` - Database migration

Run the SQL migration and you're done! 🎉
