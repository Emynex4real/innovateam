require('dotenv').config();
const supabase = require('./supabaseClient');

async function checkDatabase() {
  console.log('Checking database structure...');
  
  try {
    // Check if users table exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('Users table error:', usersError.message);
      
      // Try to create users table
      console.log('Attempting to create users table...');
      const { error: createError } = await supabase.rpc('create_users_table');
      if (createError) {
        console.log('Failed to create users table:', createError.message);
      }
    } else {
      console.log('Users table exists, sample data:', users);
    }
    
    // Check auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.log('Auth users error:', authError.message);
    } else {
      console.log('Auth users count:', authUsers.users.length);
      console.log('Sample auth user:', authUsers.users[0]);
    }
    
  } catch (error) {
    console.error('Database check error:', error);
  }
}

checkDatabase();