-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add email column to user_profiles if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, wallet_balance, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    0,
    'user',
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert admin users into auth.users (if they don't exist)
-- Note: This would normally be done through the Supabase dashboard
-- For now, we'll keep the existing user_profiles as they are

-- Update existing user_profiles to add email addresses
UPDATE user_profiles SET email = 'innovateamnigeria@gmail.com' 
WHERE id = 'ea0cd6e4-336a-4d05-be79-39887185fe4b' AND email IS NULL;

UPDATE user_profiles SET email = 'adeejidi@gmail.com' 
WHERE id = 'e98d12a8-0047-41ee-9d84-ab872959efe4' AND email IS NULL;