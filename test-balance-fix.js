const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

async function testBalanceFix() {
  console.log('🔧 Testing Balance Fix...\n');

  try {
    const userId = 'e98d12a8-0047-41ee-9d84-ab872959efe4';
    const userEmail = 'adeejidi@gmail.com';

    // 1. Check current balance
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

    // 2. Add credit transaction (this should work with publishable key)
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        user_email: userEmail,
        description: 'Test Balance Fix',
        amount: 25000,
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

    // 3. Try to update balance (this might fail due to RLS)
    const newBalance = currentProfile.wallet_balance + 25000;
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        wallet_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Balance update failed (RLS issue):', updateError);
      console.log('ℹ️  Transaction was created but balance not updated due to RLS policies');
    } else {
      console.log(`✅ Balance updated: ₦${currentProfile.wallet_balance} → ₦${newBalance}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBalanceFix();