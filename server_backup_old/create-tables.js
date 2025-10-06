require('dotenv').config();
const supabase = require('./supabaseClient');

async function createTables() {
  try {
    console.log('Creating database tables...');
    
    // Create user_profiles table
    const { error: profileError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          role VARCHAR(50) DEFAULT 'user',
          wallet_balance DECIMAL(15,2) DEFAULT 0.00,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (profileError) {
      console.log('Profile table error:', profileError);
    } else {
      console.log('✅ user_profiles table created');
    }
    
    // Create user_transactions table
    const { error: transactionError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE TABLE IF NOT EXISTS user_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          type VARCHAR(20) NOT NULL CHECK (type IN ('credit', 'debit')),
          amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
          description TEXT,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
          category VARCHAR(50) DEFAULT 'general',
          reference VARCHAR(100),
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (transactionError) {
      console.log('Transaction table error:', transactionError);
    } else {
      console.log('✅ user_transactions table created');
    }
    
    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_transactions_created_at ON user_transactions(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
      `
    });
    
    if (indexError) {
      console.log('Index error:', indexError);
    } else {
      console.log('✅ Indexes created');
    }
    
    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();