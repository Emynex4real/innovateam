const { createClient } = require('@supabase/supabase-js');

// Test the new Supabase keys
const testSupabaseConnection = async () => {
  console.log('🧪 Testing Supabase connection with new keys...');
  
  const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
  const publishableKey = 'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO';
  const secretKey = 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';
  
  try {
    // Test with publishable key
    console.log('📡 Testing with publishable key...');
    const publicClient = createClient(supabaseUrl, publishableKey);
    
    const { data: publicData, error: publicError } = await publicClient
      .from('users')
      .select('count')
      .limit(1);
    
    if (publicError) {
      console.log('⚠️ Publishable key test:', publicError.message);
    } else {
      console.log('✅ Publishable key working!');
    }
    
    // Test with secret key (admin operations)
    console.log('🔐 Testing with secret key...');
    const adminClient = createClient(supabaseUrl, secretKey);
    
    const { data: adminData, error: adminError } = await adminClient
      .from('users')
      .select('*')
      .limit(1);
    
    if (adminError) {
      console.log('⚠️ Secret key test:', adminError.message);
    } else {
      console.log('✅ Secret key working!');
      console.log(`📊 Found ${adminData?.length || 0} users`);
    }
    
    console.log('🎉 Supabase connection test completed!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
};

// Run the test
testSupabaseConnection();