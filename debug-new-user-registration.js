const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

async function debugNewUserRegistration() {
  console.log('🔍 Debugging New User Registration...\n');

  try {
    // 1. Check what's in auth.users table (we can't access this with publishable key)
    console.log('1. Checking user_profiles table for new users...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`✅ Found ${profiles.length} recent user profiles:`);
      profiles.forEach(profile => {
        console.log(`  - ${profile.full_name} (${profile.id}) - Created: ${profile.created_at}`);
      });
    }

    // 2. Test registration process
    console.log('\n2. Testing registration process...');
    
    const testEmail = `testuser${Date.now()}@example.com`;
    const testPassword = 'testpass123!';
    const testName = 'Debug Test User';

    console.log(`Attempting to register: ${testEmail}`);

    // Try Supabase auth signup
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
    } else {
      console.log('✅ Supabase auth signup successful');
      console.log('User ID:', authData.user?.id);
      console.log('Email confirmed:', authData.user?.email_confirmed_at ? 'Yes' : 'No');
      
      // Try to create user profile manually
      if (authData.user?.id) {
        console.log('\n3. Creating user profile...');
        
        const { data: profileData, error: profileError } = await supabase
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

        if (profileError) {
          console.error('❌ Profile creation failed:', profileError.message);
        } else {
          console.log('✅ Profile created successfully:', profileData);
        }
      }
    }

    // 3. Check if there are any triggers or functions that should auto-create profiles
    console.log('\n4. Checking for recent profiles again...');
    
    const { data: updatedProfiles } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('Recent profiles:');
    updatedProfiles?.forEach(profile => {
      console.log(`  - ${profile.full_name} (${profile.id})`);
    });

    console.log('\n🎉 Registration debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugNewUserRegistration();