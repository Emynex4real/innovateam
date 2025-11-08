const { createClient } = require('@supabase/supabase-js');

const testAdminData = async () => {
  console.log('🧪 Testing Admin Data Fetch...\n');
  
  const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
  const secretKey = 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';
  
  const supabase = createClient(supabaseUrl, secretKey);
  
  try {
    // Test users
    console.log('👥 Testing Users...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth users error:', authError);
    } else {
      console.log(`✅ Found ${authData.users.length} auth users`);
      authData.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    }
    
    // Test transactions
    console.log('\n💰 Testing Transactions...');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (transError) {
      console.error('❌ Transactions error:', transError);
    } else {
      console.log(`✅ Found ${transactions.length} transactions`);
      transactions.forEach(tx => {
        console.log(`   - ${tx.description}: ₦${tx.amount} (${tx.status})`);
      });
    }
    
    console.log('\n🎉 Admin data test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAdminData();