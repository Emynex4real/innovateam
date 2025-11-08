const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi'
);

async function fixWalletBalance() {
  console.log('🔧 Fixing Wallet Balance Issues...\n');

  try {
    // 1. First, let's add missing email addresses to user profiles
    console.log('📧 Adding missing email addresses...');
    
    const emailUpdates = [
      { id: 'ea0cd6e4-336a-4d05-be79-39887185fe4b', email: 'innovateamnigeria@gmail.com' },
      { id: 'f4f1492c-b616-4dc0-809b-53fc08922d94', email: 'testuser1762545092599@example.com' },
      { id: '4ba142c6-b393-4b80-8669-a96b8a391f71', email: 'testuser1762545086540@example.com' },
      { id: 'bac9bdde-4645-4adf-911b-c4de3e2f102a', email: 'testuser1762545065953@example.com' },
      { id: '131892a3-8b84-4c10-8330-7f84aaa64cf0', email: 'testuser1762545062374@example.com' },
      { id: '19116703-e3fe-433a-aa71-3aa84ced858c', email: 'testuser1762545036821@example.com' },
      { id: '721bcf9e-1907-4e37-b4e2-c451845ac2a5', email: 'testuser1762545035083@example.com' },
      { id: '1b3b66d8-883d-4a1f-bc47-ff46097232e2', email: 'admin@example.com' },
      { id: 'c72264cf-90c5-476e-a86e-b11347950ccc', email: 'olubiyiblessing@gmail.com' },
      { id: 'e98d12a8-0047-41ee-9d84-ab872959efe4', email: 'adedeji@gmail.com' }
    ];

    for (const update of emailUpdates) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ email: update.email })
        .eq('id', update.id);
      
      if (error) {
        console.log(`❌ Failed to update email for ${update.id}: ${error.message}`);
      } else {
        console.log(`✅ Updated email for ${update.id}`);
      }
    }

    // 2. Create user profile for adeejidi@gmail.com and link transactions
    console.log('\n👤 Creating profile for adeejidi@gmail.com...');
    
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'adeejidi@gmail.com')
      .single();

    let mafon_user_id;
    
    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create new profile
      mafon_user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: mafon_user_id,
          email: 'adeejidi@gmail.com',
          full_name: 'Mafon Adeejidi',
          wallet_balance: 22500,
          role: 'user',
          status: 'active',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.log(`❌ Failed to create user profile: ${insertError.message}`);
      } else {
        console.log(`✅ Created user profile for Mafon Adeejidi`);
      }
    } else {
      mafon_user_id = existingUser.id;
      console.log(`✅ User already exists with ID: ${mafon_user_id}`);
    }

    // 3. Update transactions to link them to the user_id
    console.log('\n🔗 Linking transactions to user profiles...');
    
    const { error: updateTransError } = await supabase
      .from('transactions')
      .update({ user_id: mafon_user_id })
      .eq('user_email', 'adeejidi@gmail.com');

    if (updateTransError) {
      console.log(`❌ Failed to update transactions: ${updateTransError.message}`);
    } else {
      console.log(`✅ Linked transactions to user profile`);
    }

    // 4. Recalculate and update wallet balances for all users
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
          .update({ wallet_balance: calculatedBalance })
          .eq('id', user.id);

        if (balanceError) {
          console.log(`❌ Failed to update balance for ${user.full_name}: ${balanceError.message}`);
        } else {
          console.log(`✅ Updated balance for ${user.full_name}: ₦${calculatedBalance}`);
        }
      } else {
        console.log(`✅ Balance already correct for ${user.full_name}: ₦${calculatedBalance}`);
      }
    }

    console.log('\n🎉 Wallet balance fix completed!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixWalletBalance();