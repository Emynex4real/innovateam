const { createClient } = require('@supabase/supabase-js');

const debugTransactions = async () => {
  console.log('🔍 Debugging all transactions...');
  
  const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
  const secretKey = 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';
  
  const supabase = createClient(supabaseUrl, secretKey);
  
  try {
    // Get ALL transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log(`📊 Found ${transactions.length} total transactions:`);
    
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ID: ${tx.id}`);
      console.log(`   User ID: ${tx.user_id || 'NULL'}`);
      console.log(`   User Email: ${tx.user_email || 'NULL'}`);
      console.log(`   Amount: ₦${tx.amount}`);
      console.log(`   Type: ${tx.type}`);
      console.log(`   Description: ${tx.description}`);
      console.log(`   Created: ${tx.created_at}`);
      console.log('   ---');
    });
    
    // Group by user_email if user_id is null
    const userBalances = {};
    transactions.forEach(tx => {
      const key = tx.user_id || tx.user_email || 'unknown';
      if (!userBalances[key]) {
        userBalances[key] = { balance: 0, transactions: 0 };
      }
      
      if (tx.type === 'credit') {
        userBalances[key].balance += tx.amount;
      } else if (tx.type === 'debit') {
        userBalances[key].balance -= tx.amount;
      }
      userBalances[key].transactions++;
    });
    
    console.log('\\n💰 Balance Summary:');
    for (const [key, data] of Object.entries(userBalances)) {
      console.log(`   ${key}: ₦${data.balance} (${data.transactions} transactions)`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
};

debugTransactions();