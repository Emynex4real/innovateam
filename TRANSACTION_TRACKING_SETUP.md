# Transaction Tracking & Admin Dashboard Setup

## Database Setup Required

### 1. Add wallet_balance column to users table
```sql
ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00;
UPDATE users SET wallet_balance = 0.00 WHERE wallet_balance IS NULL;
CREATE INDEX idx_users_wallet_balance ON users(wallet_balance);
```

### 2. Create transactions table (optional - for database storage)
```sql
-- Run the SQL in server/migrations/create-transactions-table.sql
-- This will replace the JSON file system with proper database storage
```

## Current Transaction System

The application currently uses:
- **JSON file storage**: `server/data/user_transactions.json`
- **Transaction Model**: `server/models/Transaction.js`
- **Admin Controller**: Enhanced to show transaction history with user data

## Admin Dashboard Features

### User Management
- **Total Users**: Count of all registered users
- **Active Users**: Users who logged in within last 7 days
- **New Users Today**: Users registered today
- **User Details**: Each user shows transaction count and total spent

### Transaction Management
- **Total Transactions**: All recorded transactions
- **Total Revenue**: Sum of completed transactions
- **Pending Transactions**: Transactions awaiting approval
- **Transaction History**: Full transaction details with user information
- **Export to CSV**: Download transaction data

## How Transactions Are Recorded

### Automatic Recording
Transactions are automatically recorded when users:
1. Purchase JAMB services
2. Buy O-Level upload services  
3. Use AI Examiner services
4. Fund their wallet

### Manual Recording (Admin)
Admins can:
1. Create new transactions
2. Update transaction status
3. Approve/reject pending transactions
4. Delete transactions

## Integration Points

### Service Purchase Integration
Add this code to your service purchase endpoints:

```javascript
const TransactionService = require('../services/transaction.service');

// When user purchases a service
await TransactionService.recordServicePurchase(userId, {
  serviceName: 'JAMB Form Purchase',
  amount: 500.00,
  category: 'jamb_services',
  serviceType: 'form_purchase',
  description: 'JAMB registration form purchase'
});
```

### Wallet Funding Integration
```javascript
// When user funds wallet
await TransactionService.recordWalletFunding(userId, amount, paymentReference);
```

## Admin Dashboard Access

### Current Admin Users
- Check `server/scripts/` for admin creation scripts
- Admin users have `role: 'admin'` in the database
- Admin dashboard accessible at `/admin`

### Admin Features
1. **Dashboard**: Overview of users and transactions
2. **User Management**: View, edit, activate/deactivate users
3. **Transaction Management**: View, edit, approve/reject transactions
4. **Export Data**: CSV export for transactions

## Testing Transaction History

### 1. Create Sample Transactions
```javascript
// Add to any service endpoint
const TransactionService = require('../services/transaction.service');

await TransactionService.recordServicePurchase(req.user.id, {
  serviceName: 'Test Service',
  amount: 100.00,
  category: 'test',
  description: 'Test transaction for admin dashboard'
});
```

### 2. Verify in Admin Dashboard
1. Login as admin user
2. Go to `/admin` dashboard
3. Check "Recent Transactions" section
4. Go to "Transactions" page for full list

### 3. Check User Count
- Dashboard shows total registered users
- Active users (last 7 days)
- New users today
- Each user shows transaction history

## Files Modified/Created

### Backend
- `server/controllers/admin.controller.js` - Enhanced with transaction data
- `server/services/transaction.service.js` - New transaction service
- `server/migrations/add-wallet-balance.sql` - Database migration
- `server/migrations/create-transactions-table.sql` - Optional DB table

### Frontend (Already Working)
- `src/pages/AdminDashboard.jsx` - Shows user counts and transaction stats
- `src/pages/AdminTransactions.jsx` - Full transaction management
- `src/services/admin.service.js` - API calls for admin data

## Next Steps

1. **Run Database Migration**: Execute the wallet_balance migration
2. **Test Transaction Recording**: Add transaction recording to your service endpoints
3. **Verify Admin Dashboard**: Login as admin and check data display
4. **Optional**: Migrate from JSON to database table for better performance

## Troubleshooting

### No Transactions Showing
- Check if `server/data/user_transactions.json` exists
- Verify transaction recording is integrated in service endpoints
- Check admin API endpoints are returning data

### User Count Issues
- Verify users table has data
- Check admin controller is fetching users correctly
- Ensure admin authentication is working

### Admin Access Issues
- Verify admin user exists with `role: 'admin'`
- Check admin authentication in AuthContext
- Ensure admin routes are protected properly