# Role Issue Fix - Professional Solution

## Problem Analysis
**Issue:** Student account accessing tutor routes
**Root Cause:** Missing role-based route protection

## Solution Implemented

### 1. Created Role-Based Route Guard
**File:** `src/components/RoleProtectedRoute.jsx`
- Checks user role from database
- Redirects unauthorized users to appropriate dashboard
- Prevents cross-role access

### 2. Updated Route Protection
**File:** `src/App.js`
- Tutor routes now use `RoleProtectedRoute` with `allowedRoles={['tutor']}`
- Student routes now use `RoleProtectedRoute` with `allowedRoles={['student']}`
- Automatic redirect based on role

### 3. Added Role-Based Login Redirect
**File:** `src/pages/login/index.jsx`
- After login, checks user role from database
- Redirects to appropriate dashboard:
  - Student → `/dashboard`
  - Tutor → `/tutor`
  - Admin → `/admin/dashboard`

## Immediate Action Required

### Step 1: Run SQL Migration
Open Supabase SQL Editor and run:

```sql
-- Add tutor role to enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tutor';

-- Check all users
SELECT id, email, role FROM public.user_profiles;
```

### Step 2: Fix Your Current User Role
Replace `YOUR_EMAIL` with your actual email:

```sql
-- If you should be a STUDENT:
UPDATE public.user_profiles 
SET role = 'student' 
WHERE email = 'YOUR_EMAIL';

-- If you should be a TUTOR:
UPDATE public.user_profiles 
SET role = 'tutor' 
WHERE email = 'YOUR_EMAIL';
```

### Step 3: Clear Cache and Re-login
1. Logout from the application
2. Clear browser data:
   - Press `Ctrl + Shift + Delete`
   - Select "Cookies and other site data"
   - Select "Cached images and files"
   - Click "Clear data"
3. Or run in browser console:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```
4. Login again

## Verification

### Test Student Account:
1. Login as student
2. Should redirect to `/dashboard`
3. Try accessing `/tutor` → Should redirect back to `/dashboard`
4. Can access `/student/centers`

### Test Tutor Account:
1. Login as tutor
2. Should redirect to `/tutor`
3. Try accessing `/student/centers` → Should redirect back to `/tutor`
4. Can create tutorial center

## Files Modified

1. ✅ `src/components/RoleProtectedRoute.jsx` - NEW
2. ✅ `src/App.js` - Updated route protection
3. ✅ `src/pages/login/index.jsx` - Added role-based redirect
4. ✅ `src/pages/register/index.jsx` - Added role selection
5. ✅ `src/services/supabaseAuth.service.js` - Save role on registration
6. ✅ `supabase/add_tutor_role.sql` - Database migration
7. ✅ `supabase/fix_user_roles.sql` - Diagnostic script

## How It Works Now

### Registration Flow:
```
User registers → Selects role (Student/Tutor) → Role saved in database
```

### Login Flow:
```
User logs in → System checks role in database → Redirects to appropriate dashboard
```

### Route Protection:
```
User tries to access route → RoleProtectedRoute checks role → 
  If authorized: Show page
  If not authorized: Redirect to correct dashboard
```

## Troubleshooting

### Still seeing wrong dashboard?
1. Check database role:
```sql
SELECT email, role FROM public.user_profiles WHERE email = 'your-email@example.com';
```

2. If role is wrong, update it:
```sql
UPDATE public.user_profiles SET role = 'student' WHERE email = 'your-email@example.com';
```

3. Clear cache and re-login

### Role not saving during registration?
1. Check if enum has tutor value:
```sql
SELECT unnest(enum_range(NULL::user_role)) AS role;
```

2. If missing, add it:
```sql
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tutor';
```

### Getting redirected in a loop?
1. Clear all browser data
2. Check if user_profiles table has your record:
```sql
SELECT * FROM public.user_profiles WHERE email = 'your-email@example.com';
```

3. If missing, create it:
```sql
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES ('your-user-id', 'your-email@example.com', 'Your Name', 'student');
```

## Support

If issues persist:
1. Check browser console for errors (F12)
2. Check Supabase logs
3. Verify RLS policies are not blocking access
4. Ensure user_profiles table exists and has data

## Next Steps

1. ✅ Run SQL migration
2. ✅ Fix your user role
3. ✅ Clear cache and re-login
4. ✅ Test both student and tutor accounts
5. ✅ Verify role-based access control works

---

**Status:** Ready for testing
**Priority:** High
**Impact:** Fixes role-based access control
