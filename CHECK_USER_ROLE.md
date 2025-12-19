# Check and Fix User Roles

## Quick Diagnostic

### 1. Check Your Current User Role

Open your browser console (F12) and run:

```javascript
// Get current user from localStorage
const user = JSON.parse(localStorage.getItem('confirmedUser'));
console.log('Current User:', user);

// Check role in database
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

supabase.from('user_profiles')
  .select('id, email, role')
  .eq('email', user.email)
  .single()
  .then(({ data }) => console.log('Database Role:', data));
```

### 2. Fix User Role via Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor
2. Open `user_profiles` table
3. Find your user by email
4. Change the `role` column to:
   - `student` - for student access
   - `tutor` - for tutor access
   - `admin` - for admin access

### 3. Fix User Role via SQL

Run this in Supabase SQL Editor:

```sql
-- Check current roles
SELECT id, email, role FROM public.user_profiles;

-- Fix specific user (replace email)
UPDATE public.user_profiles 
SET role = 'student' 
WHERE email = 'your-email@example.com';

-- Or make them a tutor
UPDATE public.user_profiles 
SET role = 'tutor' 
WHERE email = 'tutor-email@example.com';
```

### 4. Clear Cache and Re-login

After changing role:
1. Logout from the app
2. Clear browser cache (Ctrl+Shift+Delete)
3. Or run in console:
```javascript
localStorage.clear();
sessionStorage.clear();
```
4. Login again

## Common Issues

### Issue: "I'm a student but seeing tutor dashboard"

**Cause:** Your role in database is 'tutor'

**Fix:**
```sql
UPDATE public.user_profiles 
SET role = 'student' 
WHERE email = 'your-email@example.com';
```

Then logout and login again.

### Issue: "I'm a tutor but seeing student dashboard"

**Cause:** Your role in database is 'student'

**Fix:**
```sql
UPDATE public.user_profiles 
SET role = 'tutor' 
WHERE email = 'your-email@example.com';
```

Then logout and login again.

### Issue: "Role not saving during registration"

**Cause:** Database enum doesn't have 'tutor' value

**Fix:**
```sql
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tutor';
```

## Verification Steps

1. **Check Database:**
```sql
SELECT email, role FROM public.user_profiles WHERE email = 'your-email@example.com';
```

2. **Check localStorage:**
```javascript
console.log(JSON.parse(localStorage.getItem('confirmedUser')));
```

3. **Test Access:**
   - Student should access: `/dashboard`, `/student/*`
   - Tutor should access: `/tutor`, `/tutor/*`
   - Student should be redirected away from `/tutor`
   - Tutor should be redirected away from `/student/*`

## Emergency Reset

If nothing works:

```sql
-- Delete user profile
DELETE FROM public.user_profiles WHERE email = 'your-email@example.com';

-- Delete auth user
-- (Do this in Supabase Dashboard → Authentication → Users)
```

Then re-register with correct role.
