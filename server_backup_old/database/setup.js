require('dotenv').config();
const supabase = require('../supabaseClient');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL commands
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.log('Creating tables manually...');
      
      // Create user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log('user_profiles table does not exist, it will be created automatically when first user is added');
      }
      
      // Create user_transactions table  
      const { error: transactionError } = await supabase
        .from('user_transactions')
        .select('id')
        .limit(1);
        
      if (transactionError && transactionError.code === 'PGRST116') {
        console.log('user_transactions table does not exist, it will be created automatically when first transaction is added');
      }
    }
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;