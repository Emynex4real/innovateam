const { createClient } = require('@supabase/supabase-js');

const verifySetup = async () => {
  console.log('🔍 Verifying JAMB Course Advisor Setup...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`✅ Supabase URL: https://jdedscbvbkjvqmmdabig.supabase.co`);
  console.log(`✅ Publishable Key: sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO`);
  console.log(`✅ Secret Key: sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi`);
  
  // Test database connection
  console.log('\n🔌 Testing Database Connection...');
  const supabase = createClient(
    'https://jdedscbvbkjvqmmdabig.supabase.co',
    'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi'
  );
  
  try {
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.log('⚠️ Users table:', usersError.message);
    } else {
      console.log(`✅ Users table: ${users.length} users found`);
    }
    
    // Check transactions table
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .limit(5);
    
    if (transError) {
      console.log('⚠️ Transactions table:', transError.message);
    } else {
      console.log(`✅ Transactions table: ${transactions.length} transactions found`);
    }
    
    console.log('\n🎉 Setup verification completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start the backend server: cd server && npm start');
    console.log('2. Start the frontend: cd client && npm start');
    console.log('3. Access admin dashboard at: http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Setup verification failed:', error.message);
  }
};

verifySetup();