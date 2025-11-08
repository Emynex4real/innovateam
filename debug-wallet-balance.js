const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

async function debugWalletBalance() {
  console.log('🔍 Debugging Wallet Balance Issue...\n');

  try {
    // Check user_profiles table
    console.log('📊 Checking user_profiles table:');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles.length} user profiles:`);
      profiles.forEach(profile => {
        console.log(`  - ${profile.full_name} (${profile.email}): ₦${profile.wallet_balance || 0}`);
      });
    }

    console.log('\n📊 Checking transactions table:');
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (transError) {
      console.error('❌ Error fetching transactions:', transError);
    } else {
      console.log(`✅ Found ${transactions.length} transactions:`);
      
      // Group by user
      const userTransactions = {};
      transactions.forEach(trans => {
        const userId = trans.user_id || trans.user_email;
        if (!userTransactions[userId]) {
          userTransactions[userId] = { credits: 0, debits: 0, transactions: [] };
        }
        userTransactions[userId].transactions.push(trans);
        if (trans.type === 'credit') {
          userTransactions[userId].credits += trans.amount;
        } else if (trans.type === 'debit') {
          userTransactions[userId].debits += trans.amount;
        }
      });

      Object.entries(userTransactions).forEach(([userId, data]) => {
        const balance = data.credits - data.debits;
        console.log(`  - User ${userId}: ${data.transactions.length} transactions, Balance: ₦${balance}`);
        data.transactions.forEach(t => {
          console.log(`    * ${t.type} ₦${t.amount} - ${t.description} (${t.created_at})`);
        });
      });
    }

    // Check if there are any wallet balance mismatches
    console.log('\n🔍 Checking for wallet balance mismatches:');
    if (profiles && transactions) {
      for (const profile of profiles) {
        const userTrans = transactions.filter(t => 
          t.user_id === profile.id || t.user_email === profile.email
        );
        
        const calculatedBalance = userTrans.reduce((sum, t) => {
          return t.type === 'credit' ? sum + t.amount : sum - t.amount;
        }, 0);

        const storedBalance = profile.wallet_balance || 0;
        
        if (calculatedBalance !== storedBalance) {
          console.log(`⚠️  MISMATCH for ${profile.full_name}:`);
          console.log(`    Stored balance: ₦${storedBalance}`);
          console.log(`    Calculated balance: ₦${calculatedBalance}`);
          console.log(`    Transactions: ${userTrans.length}`);
        } else {
          console.log(`✅ Balance OK for ${profile.full_name}: ₦${storedBalance}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugWalletBalance();