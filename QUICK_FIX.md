# Quick Fix Instructions

## Issue: Credit Requests Not Working

### Step 1: Create the Database Table
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy ALL content from `CREDIT_REQUESTS_TABLE.sql`
4. Paste and click "Run"
5. You should see "Success. No rows returned"

### Step 2: Verify Table Created
1. Go to "Table Editor" in Supabase
2. Look for `credit_requests` table
3. If you see it, you're good!

### Step 3: Refresh Your App
1. Refresh the browser
2. Go to Admin Dashboard → Credit Requests tab
3. Should now show "No credit requests yet" (not an error)

## Understanding the Two Funding Methods

### 1. Test Funding (Instant - No Approval Needed)
**Location:** Wallet → Fund Wallet → Select "Test Funding"
- ✅ Instant credit
- ✅ For quick testing
- ✅ No admin approval needed
- ✅ Use this to test services quickly

### 2. Request Test Credit (Requires Admin Approval)
**Location:** Wallet → "Beta Testing Credit" section
- ⏳ Requires admin approval
- ⏳ Student requests → Admin approves
- ⏳ For simulating real approval flow
- ⏳ Use this to test approval process

## Which One to Use?

**For Quick Testing:**
Use "Test Funding" - instant, no waiting

**For Beta Testers:**
Use "Request Test Credit" - they request, you approve from admin

**Both are safe and can be disabled in production!**

## Still Getting Errors?

If you still see the error after running the SQL:
1. Check Supabase logs for any SQL errors
2. Make sure you're using the correct Supabase project
3. Verify RLS is enabled on the table
4. Try refreshing the page

## Production Note
Both features are controlled by `REACT_APP_ENABLE_TEST_CREDITS=false` in production.
