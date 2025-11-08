// Simulate localStorage for testing
const localStorage = {
  getItem: (key) => {
    const data = {
      'confirmedUser': JSON.stringify({
        id: 'e98d12a8-0047-41ee-9d84-ab872959efe4',
        email: 'adeejidi@gmail.com',
        name: 'Hei Mafon'
      }),
      'wallet_balance': '19000'
    };
    return data[key] || null;
  },
  setItem: (key, value) => {
    console.log(`Setting ${key} = ${value}`);
  }
};

// Mock the localStorage globally
global.localStorage = localStorage;

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

async function testCurrentUser() {
  console.log('🔍 Testing Current User and Service Purchase...\n');

  try {
    // 1. Get current user
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    console.log('👤 Current user:', currentUser);

    // 2. Get user's current balance from Supabase
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('❌ Error fetching user profile:', error);
      return;
    }

    console.log(`💰 Current balance: ₦${userProfile.wallet_balance}`);

    // 3. Test service purchase (WAEC Result Checker - ₦3500)
    const serviceAmount = 3500;
    const serviceName = 'WAEC Result Checker';

    if (userProfile.wallet_balance < serviceAmount) {
      console.log(`❌ Insufficient balance for ${serviceName}`);
      return;
    }

    console.log(`\n🛒 Attempting to purchase ${serviceName} for ₦${serviceAmount}...`);

    // Simulate the transaction process
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: currentUser.id,
        user_email: currentUser.email,
        description: `Purchased ${serviceName}`,
        amount: serviceAmount,
        type: 'debit',
        status: 'successful'
      })
      .select()
      .single();

    if (transError) {
      console.error('❌ Transaction failed:', transError);
      return;
    }

    console.log('✅ Transaction created successfully');

    // Update balance
    const newBalance = userProfile.wallet_balance - serviceAmount;
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
    console.log('\n🎉 Service purchase completed successfully!');

    // Show updated user info
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    console.log(`\n📊 Updated user profile:`);
    console.log(`  - Name: ${updatedProfile.full_name}`);
    console.log(`  - Balance: ₦${updatedProfile.wallet_balance}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCurrentUser();