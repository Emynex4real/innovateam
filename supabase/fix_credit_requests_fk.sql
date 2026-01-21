-- Fix credit_requests foreign key (optional - only if you use this feature)

-- Option 1: Fix the foreign key
ALTER TABLE credit_requests DROP CONSTRAINT IF EXISTS credit_requests_user_id_fkey;
ALTER TABLE credit_requests 
ADD CONSTRAINT credit_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Option 2: If table doesn't exist or you don't need it, ignore the error
-- The frontend will just show empty credit requests (harmless)
