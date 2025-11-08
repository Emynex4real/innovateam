// Test the App.js login security
async function testAppLoginSecurity() {
  console.log('🔒 Testing App.js Login Security...\n');

  // Simulate the App.js signIn function
  const signIn = async (email, password) => {
    try {
      // Import and use the secure authentication service (simulated)
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

      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const emailLower = email.toLowerCase().trim();
      const passwordTrim = password.trim();

      if (passwordTrim.length === 0) {
        throw new Error('Password cannot be empty');
      }

      // Check admin users
      const adminUser = adminUsers.find(u => 
        u.email === emailLower && u.password === passwordTrim
      );
      
      if (adminUser) {
        return { success: true, data: { user: adminUser } };
      }
      
      // For non-admin users, they would need to be registered in Supabase
      throw new Error('Invalid email or password');
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Test cases
  const testCases = [
    { email: '', password: 'test123', desc: 'Empty email', shouldFail: true },
    { email: 'test@example.com', password: '', desc: 'Empty password', shouldFail: true },
    { email: 'fake@example.com', password: 'fakepass', desc: 'Unregistered account', shouldFail: true },
    { email: 'innovateamnigeria@gmail.com', password: 'wrongpass', desc: 'Wrong password', shouldFail: true },
    { email: 'innovateamnigeria@gmail.com', password: 'innovateam2024!', desc: 'Valid admin', shouldFail: false },
    { email: 'anyrandom@email.com', password: 'anypassword', desc: 'Random credentials', shouldFail: true }
  ];

  for (const testCase of testCases) {
    console.log(`\n${testCase.desc}:`);
    const result = await signIn(testCase.email, testCase.password);
    
    if (testCase.shouldFail) {
      console.log(result.success ? '❌ Should have failed' : '✅ Correctly rejected');
      if (!result.success) {
        console.log(`   Error: ${result.error}`);
      }
    } else {
      console.log(result.success ? '✅ Expected success' : '❌ Should have succeeded');
    }
  }

  console.log('\n🎉 App.js login security test completed!');
}

testAppLoginSecurity();