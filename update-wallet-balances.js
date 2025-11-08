const { createClient } = require('@supabase/supabase-js');

const updateWalletBalances = async () => {
  console.log('🔄 Updating wallet balances based on transactions...');
  
  const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
  const secretKey = 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';
  
  const supabase = createClient(supabaseUrl, secretKey);
  
  try {
    // Get all transactions
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (transError) {
      console.error('❌ Error fetching transactions:', transError);
      return;
    }
    
    console.log(`📊 Found ${transactions.length} transactions`);
    
    // Calculate balance for each user
    const userBalances = {};
    
    transactions.forEach(tx => {
      const userId = tx.user_id;
      if (!userId) return;
      
      if (!userBalances[userId]) {
        userBalances[userId] = 0;
      }
      
      if (tx.type === 'credit') {
        userBalances[userId] += tx.amount;
      } else if (tx.type === 'debit') {
        userBalances[userId] -= tx.amount;
      }
    });
    
    console.log('💰 Calculated balances:', userBalances);
    
    // Update user_profiles table
    for (const [userId, balance] of Object.entries(userBalances)) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          wallet_balance: balance
        }, { onConflict: 'id' });
      
      if (updateError) {
        console.error(`❌ Error updating balance for ${userId}:`, updateError);
      } else {
        console.log(`✅ Updated ${userId}: ₦${balance}`);
      }
    }
    
    console.log('🎉 Wallet balance update completed!');
    
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }
};

updateWalletBalances();