const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

async function testWalletFunding() {
  console.log('💰 Testing Wallet Funding to Supabase...\n');

  try {
    const userId = 'e98d12a8-0047-41ee-9d84-ab872959efe4';
    const userEmail = 'adeejidi@gmail.com';

    // 1. Get current balance
    const { data: currentProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }

    console.log(`💰 Current balance: ₦${currentProfile.wallet_balance}`);

    // 2. Simulate wallet funding (₦5,000)
    const fundingAmount = 5000;
    console.log(`\n💳 Adding ₦${fundingAmount} to wallet...`);

    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        user_email: userEmail,
        description: 'Wallet Funding via card',
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

    // 3. Update wallet balance
    const newBalance = currentProfile.wallet_balance + fundingAmount;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        wallet_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Balance update failed:', updateError);
      return;
    }

    console.log(`✅ Balance updated: ₦${currentProfile.wallet_balance} → ₦${newBalance}`);

    // 4. Verify the update
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    console.log(`\n📊 Verification:`);
    console.log(`  - Expected balance: ₦${newBalance}`);
    console.log(`  - Actual balance: ₦${updatedProfile.wallet_balance}`);
    console.log(`  - Match: ${newBalance === updatedProfile.wallet_balance ? '✅' : '❌'}`);

    console.log('\n🎉 Wallet funding test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWalletFunding();