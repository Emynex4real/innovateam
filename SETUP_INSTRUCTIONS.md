# Test Credit System Setup Instructions

## Step 1: Create Database Table

1. Go to your Supabase Dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `CREDIT_REQUESTS_TABLE.sql`
5. Click "Run" to execute the SQL

## Step 2: Verify Table Creation

1. Go to "Table Editor" in Supabase
2. You should see a new table called `credit_requests`
3. Verify it has these columns:
   - id (uuid)
   - user_id (uuid)
   - amount (numeric)
   - status (text)
   - reason (text)
   - created_at (timestamp)
   - updated_at (timestamp)
   - approved_by (uuid)
   - approved_at (timestamp)

## Step 3: Test the Feature

### As a Student:
1. Login to your account
2. Go to Wallet page
3. Scroll down to "Beta Testing Credit" section
4. Click "Request Test Credit"
5. You should see "Request Pending" badge

### As an Admin:
1. Login with admin account
2. Go to Admin Dashboard
3. Click "🎁 Credit Requests" tab
4. You'll see all pending requests
5. Click "Approve" to credit ₦5,000 to student's wallet
6. Student's wallet will be updated automatically

## Features:
✅ Students can request ₦5,000 test credit
✅ One request per student
✅ Shows request status (Pending/Approved/Rejected)
✅ Admin can approve/reject from dashboard
✅ Auto-credits wallet on approval
✅ Creates transaction record
✅ Secure with Row Level Security

## Notes:
- Students can only see their own requests
- Admins can see all requests
- Approved requests automatically credit the wallet
- Transaction is created for audit trail
