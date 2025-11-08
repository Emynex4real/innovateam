const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi'
);

async function fixNegativeBalance() {
  console.log('🔧 Fixing Negative Balance Issue...\n');

  try {
    // 1. Get the user with negative balance
    const userId = 'e98d12a8-0047-41ee-9d84-ab872959efe4';
    
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
      return;
    }

    console.log(`👤 Current user: ${userProfile.full_name}`);
    console.log(`💰 Current balance: ₦${userProfile.wallet_balance}`);

    // 2. Get all transactions for this user
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (transError) {
      console.error('❌ Error fetching transactions:', transError);
      return;
    }

    console.log(`\n📊 Found ${transactions.length} transactions:`);
    
    let calculatedBalance = 0;
    transactions.forEach((t, index) => {
      const amount = t.type === 'credit' ? t.amount : -t.amount;
      calculatedBalance += amount;
      console.log(`  ${index + 1}. ${t.type} ₦${t.amount} - ${t.description} (Running total: ₦${calculatedBalance})`);
    });

    console.log(`\n💰 Balance comparison:`);
    console.log(`  - Stored balance: ₦${userProfile.wallet_balance}`);
    console.log(`  - Calculated balance: ₦${calculatedBalance}`);

    // 3. Fix the balance if there's a mismatch
    if (userProfile.wallet_balance !== calculatedBalance) {
      console.log(`\n🔧 Fixing balance mismatch...`);
      
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

      console.log(`✅ Balance updated: ₦${userProfile.wallet_balance} → ₦${calculatedBalance}`);
    } else {
      console.log(`✅ Balance is already correct`);
    }

    // 4. If balance is still negative, add a correction transaction
    if (calculatedBalance < 0) {
      console.log(`\n💳 Adding balance correction transaction...`);
      
      const correctionAmount = Math.abs(calculatedBalance) + 20000; // Add extra for testing
      
      const { data: correctionTrans, error: correctionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          user_email: 'adeejidi@gmail.com',
          description: 'Balance Correction - Admin Adjustment',
          amount: correctionAmount,
          type: 'credit',
          status: 'successful'
        })
        .select()
        .single();

      if (correctionError) {
        console.error('❌ Correction transaction failed:', correctionError);
        return;
      }

      console.log(`✅ Correction transaction added: +₦${correctionAmount}`);

      // Update the balance
      const newBalance = calculatedBalance + correctionAmount;
      const { error: finalUpdateError } = await supabase
        .from('user_profiles')
        .update({ 
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (finalUpdateError) {
        console.error('❌ Final balance update failed:', finalUpdateError);
        return;
      }

      console.log(`✅ Final balance: ₦${newBalance}`);
    }

    console.log('\n🎉 Balance fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixNegativeBalance();