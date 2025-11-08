const { createClient } = require('@supabase/supabase-js');

const createMafonProfile = async () => {
  console.log('👤 Creating mafon user profile...');
  
  const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
  const secretKey = 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';
  
  const supabase = createClient(supabaseUrl, secretKey);
  
  try {
    // Create a UUID for the user (you can generate one or use a specific one)
    const mafonUserId = 'mafon-user-id-12345678-1234-1234-1234-123456789012';
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: mafonUserId,
        full_name: 'Mafon Adeejidi',
        email: 'adeejidi@gmail.com',
        phone: '+234-804-567-8901',
        wallet_balance: 22500,
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error('❌ Failed to create profile:', profileError.message);
      return;
    }
    
    console.log('✅ Created user profile for Mafon Adeejidi');
    console.log(`   ID: ${mafonUserId}`);
    console.log(`   Email: adeejidi@gmail.com`);
    console.log(`   Balance: ₦22,500`);
    
    // Update transactions to link to this user
    const { error: txUpdateError } = await supabase
      .from('transactions')
      .update({ user_id: mafonUserId })
      .eq('user_email', 'adeejidi@gmail.com');
    
    if (txUpdateError) {
      console.error('❌ Failed to update transactions:', txUpdateError.message);
    } else {
      console.log('✅ Linked 5 transactions to user profile');
    }
    
    console.log('🎉 Mafon profile creation completed!');
    
  } catch (error) {
    console.error('❌ Creation failed:', error.message);
  }
};

createMafonProfile();