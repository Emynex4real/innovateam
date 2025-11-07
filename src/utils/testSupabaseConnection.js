import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZWRzY2J2YmtqdnFtbWRhYmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgwNzI3MywiZXhwIjoyMDc1MzgzMjczfQ.OAtp8dTtIuekKgcAo5WagT30xpzZiTivKxH-LujRFW4';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase Connection...');
  
  try {
    // Test 1: Check if transactions table exists
    console.log('📊 Testing transactions table...');
    const { data: transactions, error: transError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .limit(5);
    
    if (transError) {
      console.error('❌ Transactions table error:', transError);
      return { success: false, error: transError.message };
    }
    
    console.log('✅ Transactions table accessible');
    console.log('📋 Found transactions:', transactions?.length || 0);
    
    // Test 2: Try to insert a test transaction
    console.log('💾 Testing transaction insertion...');
    const testTransaction = {
      user_email: 'test@example.com',
      description: 'Connection Test',
      amount: 100,
      type: 'credit',
      status: 'successful'
    };
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('transactions')
      .insert(testTransaction)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return { success: false, error: insertError.message };
    }
    
    console.log('✅ Test transaction inserted:', insertData);
    
    // Test 3: Verify the transaction was saved
    const { data: verifyData, error: verifyError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('id', insertData.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Verify error:', verifyError);
      return { success: false, error: verifyError.message };
    }
    
    console.log('✅ Transaction verified:', verifyData);
    
    return { 
      success: true, 
      message: 'All tests passed!',
      totalTransactions: transactions?.length || 0,
      testTransaction: insertData
    };
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return { success: false, error: error.message };
  }
};