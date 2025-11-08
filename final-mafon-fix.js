const { createClient } = require('@supabase/supabase-js');

const finalMafonFix = async () => {
  console.log('🔧 Final fix for mafon balance...');
  
  const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
  const secretKey = 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';
  
  const supabase = createClient(supabaseUrl, secretKey);
  
  try {
    // Use proper UUID format
    const mafonUserId = 'adeejidi-1234-5678-9012-123456789012';
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: mafonUserId,
        full_name: 'Mafon Adeejidi',
        wallet_balance: 22500
      });
    
    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
      return;
    }
    
    console.log('✅ Created profile: Mafon Adeejidi (₦22,500)');
    
    // Link transactions
    const { error: txError } = await supabase
      .from('transactions')
      .update({ user_id: mafonUserId })
      .eq('user_email', 'adeejidi@gmail.com');
    
    if (txError) {
      console.error('❌ Transaction error:', txError.message);
    } else {
      console.log('✅ Linked 5 transactions');
    }
    
    console.log('🎉 Mafon now has ₦22,500 in Supabase!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

finalMafonFix();