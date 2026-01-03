# CRITICAL: Disable Email Confirmation in Supabase

## Steps to Fix Registration:

### 1. Disable Email Confirmation (REQUIRED)
1. Go to: https://supabase.com/dashboard/project/jdedscbvbkjvqmmdabig
2. Click on **Authentication** (left sidebar)
3. Click on **Settings** tab
4. Scroll to **Email Auth** section
5. Find "Enable email confirmations"
6. Toggle it **OFF**
7. Click **Save**

### 2. Test Registration
After disabling email confirmation:
1. Clear your browser cache/localStorage
2. Try registering with a new email
3. You should be able to register successfully

### 3. Check Logs (If Still Failing)
If registration still fails, check Supabase logs:
1. Go to **Logs** in Supabase Dashboard
2. Look for errors related to `user_profiles` table
3. Share the error message

### Alternative: Check Auth Settings via SQL
Run this to see current auth settings:
```sql
SELECT * FROM auth.config;
```

### Common Issues:
- Email confirmation is still enabled
- RLS policies are too restrictive
- Trigger function has errors
- Table structure mismatch
