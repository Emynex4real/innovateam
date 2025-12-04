# Complete Supabase Setup Guide

## 1. Database Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Add email column to user_profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        ALTER TABLE user_profiles ADD COLUMN email VARCHAR(255);
        
        -- Create index for faster email lookups
        CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
        
        -- Update existing records with email from auth.users
        UPDATE user_profiles 
        SET email = auth_users.email 
        FROM auth.users AS auth_users 
        WHERE user_profiles.id = auth_users.id 
        AND user_profiles.email IS NULL;
        
        RAISE NOTICE 'Email column added to user_profiles table';
    ELSE
        RAISE NOTICE 'Email column already exists in user_profiles table';
    END IF;
END $$;

-- Ensure wallet_balance has a default value
ALTER TABLE user_profiles ALTER COLUMN wallet_balance SET DEFAULT 0;

-- Update any NULL wallet balances to 0
UPDATE user_profiles SET wallet_balance = 0 WHERE wallet_balance IS NULL;
```

## 2. Verify Tables Structure

Your tables should look like this:

### user_profiles
- `id` (UUID, Primary Key)
- `email` (VARCHAR, NEW)
- `full_name` (VARCHAR)
- `wallet_balance` (DECIMAL, Default: 0)
- `role` (VARCHAR, Default: 'user')
- `status` (VARCHAR, Default: 'active')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### transactions
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to user_profiles.id)
- `user_email` (VARCHAR)
- `description` (TEXT)
- `amount` (DECIMAL)
- `type` (VARCHAR: 'credit' or 'debit')
- `status` (VARCHAR, Default: 'successful')
- `created_at` (TIMESTAMP)

## 3. What Changed in Code

### ✅ Fully Supabase-Based
- Balance stored in `user_profiles.wallet_balance`
- Transactions stored in `transactions` table
- No more localStorage for data persistence
- Works across all devices and browsers

### ✅ Removed localStorage Dependencies
- `WalletContext` now fetches from Supabase
- `cleanWallet.service` uses Supabase only
- Balance syncs across devices

### ✅ Better User Management
- Email stored in `user_profiles` table
- User lookup by ID (more reliable than email)
- Proper foreign key relationships

## 4. Testing Steps

1. **Run the SQL migration** in Supabase
2. **Deploy to Vercel** with the updated code
3. **Test on mobile**:
   - Log in with `emynex4real@gmail.com`
   - Check balance shows correctly
   - Try funding wallet
   - Verify transactions appear
   - Log out and log back in - balance should persist

## 5. Benefits

✅ **Cross-device sync** - Balance and transactions sync across all devices
✅ **No localStorage issues** - Everything stored in Supabase
✅ **Scalable** - Works for unlimited users
✅ **Reliable** - No data loss when clearing browser cache
✅ **Production ready** - Proper database relationships

## 6. Environment Variables

Make sure these are set in Vercel:
```
REACT_APP_SUPABASE_URL=https://jdedscbvbkjvqmmdabig.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO
```

## 7. Rollback Plan (if needed)

If something breaks, you can rollback by:
1. Reverting the code changes
2. The database changes are safe to keep (they only add, don't remove)

The migration is designed to be safe and non-destructive.