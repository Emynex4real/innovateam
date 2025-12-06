# Question Bank Admin Page Fix

## Issue
The question bank feature in the admin page is not working properly.

## Root Causes Identified

1. **Authentication Middleware Issue**: The `requireAdmin` middleware had a temporary bypass that wasn't properly checking admin roles
2. **Missing Error Handling**: Frontend wasn't showing proper error messages
3. **Possible Database Setup**: Tables might not be created or RLS policies not configured

## Fixes Applied

### 1. Backend Authentication Fix
**File**: `server/middleware/authenticate.js`

- Fixed `requireAdmin` middleware to properly verify admin role
- Removed temporary bypass that allowed all authenticated users
- Added better error logging

### 2. Frontend Error Handling
**Files**: 
- `src/services/aiQuestions.service.js`
- `src/pages/admin/AIQuestions.jsx`

- Added comprehensive error logging
- Added user-friendly toast notifications
- Better error messages for debugging

## Testing Steps

### Step 1: Verify Database Setup

Run the test script:
```bash
node test-question-banks.js
```

This will check:
- ✅ If tables exist
- ✅ Current data count
- ✅ RLS policies
- ✅ List existing banks

### Step 2: Verify Database Tables

If tables don't exist, run this SQL in Supabase:
```sql
-- File: supabase/ai_question_banks.sql
```

Go to Supabase Dashboard → SQL Editor → Run the entire `ai_question_banks.sql` file

### Step 3: Verify Admin User

Make sure your user has admin role:
```sql
-- Check your user role
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- If not admin, update it
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'your-email@example.com';
```

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to Admin → AI Questions
4. Look for error messages:
   - ❌ 401 Unauthorized → Authentication issue
   - ❌ 403 Forbidden → Not admin
   - ❌ 404 Not Found → Route not registered
   - ❌ 500 Server Error → Backend issue

### Step 5: Check Network Tab

1. Open DevTools → Network tab
2. Navigate to Admin → AI Questions
3. Look for API calls to `/api/admin/ai-questions/banks`
4. Check:
   - Request Headers (Authorization token present?)
   - Response Status (200, 401, 403, 500?)
   - Response Body (error message?)

### Step 6: Check Server Logs

In your server terminal, you should see:
```
✅ User authenticated: your-email@example.com Role: admin IsAdmin: true
```

If you see:
```
❌ Token verification failed
```
→ Token is invalid or expired, try logging out and back in

If you see:
```
Admin access required
```
→ User is not admin, update role in database

## Common Issues & Solutions

### Issue 1: "Authentication required"
**Solution**: 
- Check if you're logged in
- Check browser localStorage for auth token
- Try logging out and back in

### Issue 2: "Admin access required"
**Solution**:
- Verify your user has admin role in database
- Run the SQL query in Step 3 above

### Issue 3: Tables don't exist
**Solution**:
- Run `supabase/ai_question_banks.sql` in Supabase SQL Editor
- Verify tables created with test script

### Issue 4: RLS Policy Blocking Access
**Solution**:
```sql
-- Temporarily disable RLS for testing
ALTER TABLE question_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;

-- Test if it works now
-- If yes, the issue is with RLS policies

-- Re-enable RLS
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Fix policies (make sure users table exists)
-- The policies reference the 'users' table which should have role column
```

### Issue 5: CORS Error
**Solution**:
- Check `server/server.js` CORS configuration
- Make sure your frontend URL is in `allowedOrigins`
- Check if server is running on correct port (5000)

### Issue 6: Empty Response
**Solution**:
- This is normal if no question banks exist yet
- Try generating questions first
- Check "Generate" tab and create a question bank

## Manual Testing Checklist

- [ ] Server is running (`npm start` in server folder)
- [ ] Frontend is running (`npm start` in client folder)
- [ ] User is logged in
- [ ] User has admin role in database
- [ ] Tables exist in Supabase
- [ ] RLS policies are configured
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] Can see "Generate" tab
- [ ] Can see "Banks" tab
- [ ] Can see "Questions" tab

## API Endpoints

All endpoints require admin authentication:

- `POST /api/admin/ai-questions/generate` - Generate questions
- `GET /api/admin/ai-questions/banks` - Get all banks
- `GET /api/admin/ai-questions/banks/:bankId/questions` - Get questions by bank
- `DELETE /api/admin/ai-questions/banks/:id` - Delete bank
- `DELETE /api/admin/ai-questions/questions/:id` - Delete question
- `POST /api/admin/ai-questions/questions/bulk-delete` - Bulk delete
- `PATCH /api/admin/ai-questions/questions/:id/toggle` - Toggle status
- `GET /api/admin/ai-questions/stats` - Get statistics

## Environment Variables

Make sure these are set in `server/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key  # For question generation
```

## Next Steps

1. Run the test script to verify database setup
2. Check browser console for specific errors
3. Verify admin role in database
4. Check server logs for authentication issues
5. If still not working, share the specific error message

## Support

If you're still having issues, provide:
1. Browser console errors (screenshot)
2. Network tab response (screenshot)
3. Server logs (copy/paste)
4. Result of test script
