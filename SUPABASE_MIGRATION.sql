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