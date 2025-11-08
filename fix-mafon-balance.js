const { createClient } = require('@supabase/supabase-js');

const fixMafonBalance = async () => {
  console.log('🔧 Fixing mafon wallet balance...');
  
  const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
  const secretKey = 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';
  
  const supabase = createClient(supabaseUrl, secretKey);
  
  try {
    // First, find the user ID for adeejidi@gmail.com
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    
    const mafonUser = authUsers.users.find(user => user.email === 'adeejidi@gmail.com');
    
    if (!mafonUser) {
      console.log('❌ User adeejidi@gmail.com not found in auth users');
      return;
    }
    
    console.log(`✅ Found user: ${mafonUser.email} (ID: ${mafonUser.id})`);
    
    // Update user_profiles with correct balance
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        id: mafonUser.id,
        full_name: 'Mafon Adeejidi',
        email: 'adeejidi@gmail.com',
        wallet_balance: 22500,
        role: 'user',
        status: 'active',
        updated_at: new Date().toISOString()
      });
    
    if (updateError) {
      console.error('❌ Failed to update profile:', updateError.message);
    } else {
      console.log('✅ Updated user profile with ₦22,500 balance');
    }
    
    // Also update the transactions to have the correct user_id
    const { error: txUpdateError } = await supabase
      .from('transactions')
      .update({ user_id: mafonUser.id })
      .eq('user_email', 'adeejidi@gmail.com');
    
    if (txUpdateError) {
      console.error('❌ Failed to update transactions:', txUpdateError.message);
    } else {
      console.log('✅ Updated transactions with correct user_id');
    }
    
    console.log('🎉 Mafon balance fix completed!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
};

fixMafonBalance();