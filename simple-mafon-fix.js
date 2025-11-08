const { createClient } = require('@supabase/supabase-js');

const simpleMafonFix = async () => {
  console.log('🔧 Simple fix for mafon balance...');
  
  const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
  const secretKey = 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';
  
  const supabase = createClient(supabaseUrl, secretKey);
  
  try {
    // Use a simple UUID for mafon
    const mafonUserId = 'adeejidi-mafon-user-1234-5678-9012-345678901234';
    
    // Create minimal user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: mafonUserId,
        full_name: 'Mafon Adeejidi',
        wallet_balance: 22500,
        role: 'user',
        status: 'active'
      });
    
    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
      return;
    }
    
    console.log('✅ Created profile for Mafon with ₦22,500');
    
    // Update transactions
    const { error: txError } = await supabase
      .from('transactions')
      .update({ user_id: mafonUserId })
      .eq('user_email', 'adeejidi@gmail.com');
    
    if (txError) {
      console.error('❌ Transaction update error:', txError.message);
    } else {
      console.log('✅ Linked transactions to user');
    }
    
    console.log('🎉 Fix completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

simpleMafonFix();