const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi'
);

async function debugServicePurchase() {
  console.log('🔍 Debugging Service Purchase Flow...\n');

  try {
    // 1. Check current user with highest balance
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('wallet_balance', { ascending: false })
      .limit(1);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return;
    }

    const testUser = users[0];
    console.log(`👤 Testing with user: ${testUser.full_name} (Balance: ₦${testUser.wallet_balance})`);

    // 2. Test adding a debit transaction (service purchase)
    console.log('\n💳 Testing service purchase transaction...');
    
    const serviceAmount = 3500; // WAEC result checker price
    const serviceName = 'WAEC Result Checker';

    if (testUser.wallet_balance < serviceAmount) {
      console.log(`❌ Insufficient balance: ₦${testUser.wallet_balance} < ₦${serviceAmount}`);
      return;
    }

    // Add debit transaction
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .insert({
        user_id: testUser.id,
        user_email: 'adeejidi@gmail.com', // Known email for this user
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

    console.log('✅ Transaction created:', transaction);

    // 3. Update user wallet balance
    const newBalance = testUser.wallet_balance - serviceAmount;
    
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        wallet_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', testUser.id);

    if (updateError) {
      console.error('❌ Balance update failed:', updateError);
      return;
    }

    console.log(`✅ Balance updated: ₦${testUser.wallet_balance} → ₦${newBalance}`);

    // 4. Verify the transaction was recorded
    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false });

    console.log(`\n📊 User now has ${allTransactions.length} transactions:`);
    allTransactions.forEach(t => {
      console.log(`  - ${t.type} ₦${t.amount} - ${t.description} (${t.created_at})`);
    });

    // Calculate final balance from transactions
    const calculatedBalance = allTransactions.reduce((sum, t) => {
      return t.type === 'credit' ? sum + t.amount : sum - t.amount;
    }, 0);

    console.log(`\n💰 Final balance verification:`);
    console.log(`  - Stored balance: ₦${newBalance}`);
    console.log(`  - Calculated balance: ₦${calculatedBalance}`);
    console.log(`  - Match: ${newBalance === calculatedBalance ? '✅' : '❌'}`);

    console.log('\n🎉 Service purchase test completed successfully!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugServicePurchase();