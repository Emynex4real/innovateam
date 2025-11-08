// Test login security - ensure unregistered accounts cannot login
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

// Simulate the authentication service
const adminUsers = [
  {
    id: 'ea0cd6e4-336a-4d05-be79-39887185fe4b',
    email: 'innovateamnigeria@gmail.com',
    password: 'innovateam2024!',
    name: 'Innovateam Nigeria',
    role: 'admin'
  },
  {
    id: 'e98d12a8-0047-41ee-9d84-ab872959efe4',
    email: 'adeejidi@gmail.com',
    password: 'mafon123!',
    name: 'Hei Mafon',
    role: 'admin'
  }
];

async function testLogin(email, password) {
  try {
    console.log(`🔐 Testing login: ${email}`);
    
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const emailLower = email.toLowerCase().trim();
    const passwordTrim = password.trim();

    if (passwordTrim.length === 0) {
      throw new Error('Password cannot be empty');
    }

    // First try admin users
    const adminUser = adminUsers.find(u => 
      u.email === emailLower && u.password === passwordTrim
    );
    
    if (adminUser) {
      console.log('✅ Admin login successful');
      return { success: true, user: adminUser };
    }
    
    // Try Supabase auth for new users
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLower,
      password: passwordTrim
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password');
      }
      throw new Error('Login failed: ' + error.message);
    }

    console.log('✅ Supabase login successful');
    return { success: true, user: data.user };
    
  } catch (error) {
    console.log('❌ Login failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testLoginSecurity() {
  console.log('🔒 Testing Login Security...\n');

  // Test cases
  const testCases = [
    { email: '', password: 'test123', desc: 'Empty email' },
    { email: 'test@example.com', password: '', desc: 'Empty password' },
    { email: 'nonexistent@example.com', password: 'wrongpass', desc: 'Unregistered account' },
    { email: 'innovateamnigeria@gmail.com', password: 'wrongpass', desc: 'Wrong password for admin' },
    { email: 'innovateamnigeria@gmail.com', password: 'innovateam2024!', desc: 'Correct admin credentials' },
    { email: 'fake@gmail.com', password: 'fakepass123', desc: 'Completely fake account' }
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.desc}:`);
    const result = await testLogin(testCase.email, testCase.password);
    
    if (testCase.desc.includes('Correct admin')) {
      console.log(result.success ? '✅ Expected success' : '❌ Should have succeeded');
    } else {
      console.log(result.success ? '❌ Should have failed' : '✅ Correctly rejected');
    }
  }

  console.log('\n🎉 Login security test completed!');
}

testLoginSecurity();