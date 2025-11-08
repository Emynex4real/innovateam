const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

async function testProperRegistration() {
  console.log('🧪 Testing Proper User Registration...\n');

  try {
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@gmail.com`;
    const testPassword = 'testuser123!';
    const testName = `Test User ${timestamp}`;

    console.log(`1. Attempting to register: ${testEmail}`);

    // Try Supabase auth signup with proper email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName
        }
      }
    });

    if (authError) {
      console.error('❌ Supabase auth signup failed:', authError.message);
      return;
    }

    console.log('✅ Supabase auth signup successful!');
    console.log('User ID:', authData.user?.id);
    console.log('Email:', authData.user?.email);
    console.log('Email confirmed:', authData.user?.email_confirmed_at ? 'Yes' : 'No');

    // Wait a moment for any triggers to run
    console.log('\n2. Waiting for triggers to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if user profile was auto-created
    console.log('\n3. Checking if user profile was created...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.log('❌ No auto-created profile found:', profileError.message);
      
      // Manually create the profile
      console.log('\n4. Manually creating user profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          full_name: testName,
          wallet_balance: 0,
          role: 'user',
          status: 'active'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Manual profile creation failed:', createError.message);
      } else {
        console.log('✅ Profile created manually:', newProfile);
      }
    } else {
      console.log('✅ Profile was auto-created:', profile);
    }

    // Check all recent profiles
    console.log('\n5. Checking all recent user profiles...');
    const { data: allProfiles } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('Recent profiles:');
    allProfiles?.forEach((p, index) => {
      console.log(`  ${index + 1}. ${p.full_name} (${p.id}) - ${p.created_at}`);
    });

    console.log('\n🎉 Registration test completed!');
    console.log('📋 Summary:');
    console.log(`  - Email: ${testEmail}`);
    console.log(`  - User ID: ${authData.user?.id}`);
    console.log(`  - Profile created: ${profile || newProfile ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProperRegistration();