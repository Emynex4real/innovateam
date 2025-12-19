# 🔧 Fix Tutor Access Issue

## Problem
Accessing `/tutor` redirects to `/dashboard`

## Root Cause
Your user role in the database is `student` but you need `tutor` role.

---

## ✅ Solution (3 Steps)

### Step 1: Check Your Role

**Option A - Browser Console:**
1. Open browser console (F12)
2. Paste this:
```javascript
const user = JSON.parse(localStorage.getItem('confirmedUser'));
console.log('Email:', user.email);
console.log('Role:', user.role);
console.log('User ID:', user.id);
```

**Option B - Open File:**
Open `CHECK_MY_ROLE.html` in your browser and click the button.

### Step 2: Fix Your Role in Database

1. Open Supabase Dashboard → SQL Editor
2. Run this to see all users:
```sql
SELECT id, email, role FROM public.user_profiles;
```

3. Find your email, then run:
```sql
-- Replace YOUR_EMAIL with your actual email
UPDATE public.user_profiles 
SET role = 'tutor' 
WHERE email = 'YOUR_EMAIL@example.com';
```

4. Verify:
```sql
SELECT email, role FROM public.user_profiles WHERE email = 'YOUR_EMAIL@example.com';
```

### Step 3: Clear Cache & Re-login

1. **Logout** from the app
2. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Select "Cookies and other site data"
   - Select "Cached images and files"
   - Click "Clear data"
3. **Or run in console:**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```
4. **Login again**
5. **Try accessing** `/tutor`

---

## 🔍 Debugging

### Check Console Logs

After the fix, when you access `/tutor`, you should see in console:

```
✅ User role from DB: tutor
Allowed roles: ['tutor']
Has access: true
✅ Access granted
```

If you see:
```
🚫 Access denied. Redirecting...
```

Then your role is still not `tutor` in the database.

### Verify Database Role

```sql
-- Check your role
SELECT email, role FROM public.user_profiles WHERE email = 'your-email@example.com';

-- Should return:
-- email: your-email@example.com
-- role: tutor
```

---

## 🎯 Quick Test

After fixing:

1. **Login**
2. **Navigate to** `/tutor`
3. **Should see:** "Welcome, Tutor!" or your tutorial center dashboard
4. **Should NOT redirect** to `/dashboard`

---

## 🐛 Still Not Working?

### Issue 1: Role not saving
**Check if enum has tutor value:**
```sql
SELECT unnest(enum_range(NULL::user_role)) AS role;
```

**Should show:**
- student
- tutor
- admin

**If tutor is missing:**
```sql
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tutor';
```

### Issue 2: User profile doesn't exist
**Check if profile exists:**
```sql
SELECT * FROM public.user_profiles WHERE email = 'your-email@example.com';
```

**If no results, create profile:**
```sql
INSERT INTO public.user_profiles (id, email, full_name, role)
VALUES (
  'your-user-id-from-auth-users',
  'your-email@example.com',
  'Your Name',
  'tutor'
);
```

### Issue 3: Cache not cleared
**Force clear everything:**
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('firebaseLocalStorageDb');
caches.keys().then(names => names.forEach(name => caches.delete(name)));
location.reload();
```

---

## 📋 Checklist

Before asking for help, verify:

- [ ] Ran SQL to check role
- [ ] Role is 'tutor' in database
- [ ] Logged out completely
- [ ] Cleared browser cache
- [ ] Logged back in
- [ ] Checked browser console for errors
- [ ] Verified user_profiles table exists
- [ ] Verified enum has 'tutor' value

---

## 🆘 Emergency Reset

If nothing works:

```sql
-- Delete your profile
DELETE FROM public.user_profiles WHERE email = 'your-email@example.com';

-- Delete from auth (in Supabase Dashboard → Authentication → Users)
-- Then re-register with tutor role
```

---

## ✅ Expected Behavior

### As Tutor:
- ✅ Can access `/tutor`
- ✅ Can access `/tutor/questions`
- ✅ Can access `/tutor/tests`
- ❌ Cannot access `/student/centers`

### As Student:
- ✅ Can access `/dashboard`
- ✅ Can access `/student/centers`
- ❌ Cannot access `/tutor`

---

## 📞 Support

If still having issues, provide:
1. Your email (from database)
2. Your role (from database)
3. Console logs when accessing `/tutor`
4. Screenshot of SQL query results
