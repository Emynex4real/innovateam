// Simulate localStorage for testing
const localStorage = {
  getItem: (key) => {
    // Check what user is currently logged in
    const data = {
      'confirmedUser': JSON.stringify({
        id: 'ea0cd6e4-336a-4d05-be79-39887185fe4b', // This might be the wrong user
        email: 'innovateamnigeria@gmail.com',
        name: 'Innovateam Nigeria'
      })
    };
    return data[key] || null;
  }
};

global.localStorage = localStorage;

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

async function debugCurrentUserFunding() {
  console.log('🔍 Debugging Current User Funding Issue...\n');

  try {
    // 1. Check what user is in localStorage
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    console.log('👤 Current user from localStorage:', currentUser);

    // 2. Check this user's profile in Supabase
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      console.log('ℹ️  This user might not exist in user_profiles table');
      
      // Check all users to see who has balance
      const { data: allUsers } = await supabase
        .from('user_profiles')
        .select('*')
        .order('wallet_balance', { ascending: false });
      
      console.log('\n📊 All users with balances:');
      allUsers.forEach(user => {
        if (user.wallet_balance > 0) {
          console.log(`  - ${user.full_name} (${user.id}): ₦${user.wallet_balance}`);
        }
      });
      
      return;
    }

    console.log(`💰 User profile found: ${userProfile.full_name}`);
    console.log(`💰 Current balance: ₦${userProfile.wallet_balance}`);

    // 3. Test funding for this user
    console.log('\n💳 Testing wallet funding...');
    
    const fundingAmount = 1000;
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: currentUser.id,
        user_email: currentUser.email,
        description: 'Test Wallet Funding',
        amount: fundingAmount,
        type: 'credit',
        status: 'successful'
      })
      .select()
      .single();

    if (transError) {
      console.error('❌ Transaction failed:', transError);
      return;
    }

    console.log('✅ Transaction created successfully');

    // 4. Update balance
    const newBalance = userProfile.wallet_balance + fundingAmount;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        wallet_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id);

    if (updateError) {
      console.error('❌ Balance update failed:', updateError);
      return;
    }

    console.log(`✅ Balance updated: ₦${userProfile.wallet_balance} → ₦${newBalance}`);
    console.log('\n🎉 Funding test completed successfully!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugCurrentUserFunding();