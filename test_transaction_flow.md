# Transaction Flow Test Guide

## Current Setup Status ✅

1. **Routing Fixed**: `/admin/simple` route added to App.js
2. **Services Connected**: 
   - `simpleWallet.service.js` - Direct Supabase access
   - `cleanWallet.service.js` - Handles user transactions + localStorage
   - `wallet.service.js` - Main service using clean service
3. **Admin Dashboard**: `SimpleAdminDashboard.jsx` with real-time updates

## Test Steps

### 1. Access Admin Dashboard
- Navigate to: `http://localhost:3000/admin/simple`
- Should see "Simple Admin Dashboard" with test buttons

### 2. Test Supabase Connection
- Click "Test Supabase" button
- Should create a test transaction and verify table access
- Check browser console for detailed logs

### 3. Create Real User
- Click "Create Test User" button
- Creates real Supabase auth user
- Updates localStorage with real UUID

### 4. Test Transaction Flow
- Click "Test Transaction" button
- Creates transaction for current user
- Should appear in admin dashboard immediately

### 5. Test User Wallet Actions
- Go to `/dashboard/wallet`
- Try funding wallet
- Try making a purchase
- All transactions should appear in admin dashboard

## Expected Results

- All user wallet activities save to Supabase `transactions` table
- Admin dashboard shows real-time updates every 10 seconds
- No foreign key constraint errors
- Transactions include user email for identification

## Troubleshooting

If transactions don't appear:
1. Check browser console for errors
2. Verify Supabase connection with "Test Supabase" button
3. Ensure user has valid email in localStorage
4. Check if transactions table exists in Supabase

## Database Schema

```sql
transactions table:
- id (UUID, primary key)
- user_email (TEXT, not null)
- description (TEXT, not null) 
- amount (DECIMAL)
- type ('credit' | 'debit')
- status ('successful' | 'pending' | 'failed')
- created_at (TIMESTAMP)
```