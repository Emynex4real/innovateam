const { createClient } = require('@supabase/supabase-js');

const syncWalletBalance = async () => {
  console.log('🔄 Syncing wallet balances...');
  
  const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
  const secretKey = 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';
  
  const supabase = createClient(supabaseUrl, secretKey);
  
  try {
    // Get all transactions grouped by user
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('user_id, amount, type')
      .not('user_id', 'is', null);
    
    if (error) throw error;
    
    // Calculate balance for each user
    const userBalances = {};
    transactions.forEach(tx => {
      if (!userBalances[tx.user_id]) {
        userBalances[tx.user_id] = 0;
      }
      
      if (tx.type === 'credit') {
        userBalances[tx.user_id] += tx.amount;
      } else if (tx.type === 'debit') {
        userBalances[tx.user_id] -= tx.amount;
      }
    });
    
    console.log('💰 Calculated balances:');
    for (const [userId, balance] of Object.entries(userBalances)) {
      console.log(`   ${userId}: ₦${balance}`);
      
      // Update or insert user profile with wallet balance
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          wallet_balance: balance,
          updated_at: new Date().toISOString()
        });
      
      if (upsertError) {
        console.error(`❌ Failed to update ${userId}:`, upsertError.message);
      } else {
        console.log(`✅ Updated ${userId}: ₦${balance}`);
      }
    }
    
    console.log('🎉 Wallet sync completed!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
  }
};

syncWalletBalance();