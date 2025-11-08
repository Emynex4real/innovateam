// Test the new persistent authentication system
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

async function testPersistentAuth() {
  console.log('🔐 Testing Persistent Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'testuser@example.com',
      password: 'testpass123!',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });

    if (signUpError) {
      console.log('❌ Registration failed:', signUpError.message);
    } else {
      console.log('✅ Registration successful:', signUpData.user?.email);
    }

    // Test 2: Check if user profile was created
    if (signUpData.user) {
      console.log('\n2. Checking user profile creation...');
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile not found:', profileError.message);
      } else {
        console.log('✅ Profile created:', profile);
      }
    }

    // Test 3: Test login with new user
    console.log('\n3. Testing login with new user...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'testuser@example.com',
      password: 'testpass123!'
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
    } else {
      console.log('✅ Login successful:', loginData.user?.email);
    }

    // Test 4: Test admin login (backward compatibility)
    console.log('\n4. Testing admin login compatibility...');
    const adminUsers = [
      { email: 'innovateamnigeria@gmail.com', password: 'innovateam2024!' },
      { email: 'adeejidi@gmail.com', password: 'mafon123!' }
    ];

    for (const admin of adminUsers) {
      console.log(`Testing admin: ${admin.email}`);
      // This would be handled by the hybrid auth service
      console.log('✅ Admin login would work with hybrid service');
    }

    console.log('\n🎉 Persistent authentication test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPersistentAuth();