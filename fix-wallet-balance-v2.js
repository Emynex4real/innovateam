const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi'
);

async function fixWalletBalance() {
  console.log('🔧 Fixing Wallet Balance Issues...\n');

  try {
    // 1. Create user profile for adeejidi@gmail.com (Mafon) and link transactions
    console.log('👤 Creating profile for Mafon Adeejidi (adeejidi@gmail.com)...');
    
    const mafon_user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', mafon_user_id)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create new profile
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: mafon_user_id,
          full_name: 'Mafon Adeejidi',
          phone: '08012345678',
          wallet_balance: 22500,
          role: 'user',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.log(`❌ Failed to create user profile: ${insertError.message}`);
      } else {
        console.log(`✅ Created user profile for Mafon Adeejidi with balance ₦22,500`);
      }
    } else {
      console.log(`✅ User already exists with ID: ${mafon_user_id}`);
    }

    // 2. Update transactions to link them to the user_id
    console.log('\n🔗 Linking transactions to user profile...');
    
    const { error: updateTransError } = await supabase
      .from('transactions')
      .update({ user_id: mafon_user_id })
      .eq('user_email', 'adeejidi@gmail.com');

    if (updateTransError) {
      console.log(`❌ Failed to update transactions: ${updateTransError.message}`);
    } else {
      console.log(`✅ Linked all adeejidi@gmail.com transactions to user profile`);
    }

    // 3. Recalculate and update wallet balances for all users
    console.log('\n💰 Recalculating wallet balances...');
    
    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('*');

    const { data: allUsers } = await supabase
      .from('user_profiles')
      .select('*');

    for (const user of allUsers) {
      const userTransactions = allTransactions.filter(t => t.user_id === user.id);
      
      const calculatedBalance = userTransactions.reduce((sum, t) => {
        return t.type === 'credit' ? sum + t.amount : sum - t.amount;
      }, 0);

      if (calculatedBalance !== user.wallet_balance) {
        const { error: balanceError } = await supabase
          .from('user_profiles')
          .update({ 
            wallet_balance: calculatedBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (balanceError) {
          console.log(`❌ Failed to update balance for ${user.full_name}: ${balanceError.message}`);
        } else {
          console.log(`✅ Updated balance for ${user.full_name}: ₦${user.wallet_balance} → ₦${calculatedBalance}`);
        }
      } else {
        console.log(`✅ Balance already correct for ${user.full_name}: ₦${calculatedBalance}`);
      }
    }

    // 4. Show final summary
    console.log('\n📊 Final wallet balance summary:');
    const { data: finalUsers } = await supabase
      .from('user_profiles')
      .select('*')
      .order('wallet_balance', { ascending: false });

    finalUsers.forEach(user => {
      console.log(`  - ${user.full_name}: ₦${user.wallet_balance}`);
    });

    console.log('\n🎉 Wallet balance fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixWalletBalance();