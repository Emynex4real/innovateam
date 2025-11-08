const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

async function checkTableStructure() {
  console.log('🔍 Checking table structure...\n');

  try {
    // Get a sample user profile to see the structure
    const { data: profiles, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('📊 User profiles table structure:');
      if (profiles && profiles.length > 0) {
        console.log('Columns:', Object.keys(profiles[0]));
        console.log('Sample data:', profiles[0]);
      }
    }

    // Check transactions table
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);

    if (transError) {
      console.error('❌ Transactions error:', transError);
    } else {
      console.log('\n📊 Transactions table structure:');
      if (transactions && transactions.length > 0) {
        console.log('Columns:', Object.keys(transactions[0]));
        console.log('Sample data:', transactions[0]);
      }
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkTableStructure();