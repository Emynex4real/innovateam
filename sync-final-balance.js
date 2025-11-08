const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi'
);

async function syncFinalBalance() {
  console.log('🔄 Syncing Final Balance...\n');

  try {
    const userId = 'e98d12a8-0047-41ee-9d84-ab872959efe4';

    // Get all transactions for this user
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (transError) {
      console.error('❌ Error fetching transactions:', transError);
      return;
    }

    // Calculate correct balance
    const calculatedBalance = transactions.reduce((sum, t) => {
      return t.type === 'credit' ? sum + t.amount : sum - t.amount;
    }, 0);

    console.log(`📊 Found ${transactions.length} transactions`);
    console.log(`💰 Calculated balance: ₦${calculatedBalance}`);

    // Update the user's balance to match transactions
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        wallet_balance: calculatedBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Balance update failed:', updateError);
      return;
    }

    console.log(`✅ Balance synced to ₦${calculatedBalance}`);
    console.log('\n🎉 Final balance sync completed!');

  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

syncFinalBalance();