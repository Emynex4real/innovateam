const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi'
);

async function fixOrphanedTransactions() {
  console.log('🔧 Fixing Orphaned Transactions...\n');

  try {
    // 1. Get all transactions with user_email but no user_id
    console.log('🔍 Finding orphaned transactions...');
    const { data: orphanedTransactions, error: orphanError } = await supabase
      .from('transactions')
      .select('*')
      .is('user_id', null)
      .not('user_email', 'is', null);

    if (orphanError) {
      console.error('❌ Error finding orphaned transactions:', orphanError);
      return;
    }

    console.log(`Found ${orphanedTransactions.length} orphaned transactions`);

    // 2. Get all existing user profiles
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*');

    if (profileError) {
      console.error('❌ Error getting user profiles:', profileError);
      return;
    }

    console.log(`Found ${userProfiles.length} user profiles`);

    // 3. For adeejidi@gmail.com transactions, let's assign them to an existing user
    // Let's use the "Hei Mafon" user since that might be the same person
    const mafon_user = userProfiles.find(u => u.full_name === 'Hei Mafon');
    
    if (mafon_user) {
      console.log(`\n🔗 Linking adeejidi@gmail.com transactions to ${mafon_user.full_name} (${mafon_user.id})`);
      
      const { error: linkError } = await supabase
        .from('transactions')
        .update({ user_id: mafon_user.id })
        .eq('user_email', 'adeejidi@gmail.com');

      if (linkError) {
        console.error('❌ Failed to link transactions:', linkError);
      } else {
        console.log('✅ Successfully linked transactions');
        
        // Calculate the new balance
        const adeejidiTransactions = orphanedTransactions.filter(t => t.user_email === 'adeejidi@gmail.com');
        const balance = adeejidiTransactions.reduce((sum, t) => {
          return t.type === 'credit' ? sum + t.amount : sum - t.amount;
        }, 0);

        // Update the user's wallet balance
        const { error: balanceError } = await supabase
          .from('user_profiles')
          .update({ 
            wallet_balance: balance,
            updated_at: new Date().toISOString()
          })
          .eq('id', mafon_user.id);

        if (balanceError) {
          console.error('❌ Failed to update wallet balance:', balanceError);
        } else {
          console.log(`✅ Updated wallet balance to ₦${balance}`);
        }
      }
    }

    // 4. Show final summary
    console.log('\n📊 Final summary:');
    const { data: finalUsers } = await supabase
      .from('user_profiles')
      .select('*')
      .order('wallet_balance', { ascending: false });

    const { data: finalTransactions } = await supabase
      .from('transactions')
      .select('*');

    finalUsers.forEach(user => {
      const userTrans = finalTransactions.filter(t => t.user_id === user.id);
      console.log(`  - ${user.full_name}: ₦${user.wallet_balance} (${userTrans.length} transactions)`);
    });

    // Check for remaining orphaned transactions
    const remainingOrphaned = finalTransactions.filter(t => !t.user_id);
    if (remainingOrphaned.length > 0) {
      console.log(`\n⚠️  Still ${remainingOrphaned.length} orphaned transactions:`);
      remainingOrphaned.forEach(t => {
        console.log(`    - ${t.user_email}: ${t.type} ₦${t.amount} - ${t.description}`);
      });
    }

    console.log('\n🎉 Fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixOrphanedTransactions();