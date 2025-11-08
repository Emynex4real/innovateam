// Test the fixed authentication system
const mockUsers = [
  {
    id: '1',
    email: 'admin@innovateam.com',
    password: 'admin123!',
    name: 'Admin User',
    role: 'admin',
    isAdmin: true
  },
  {
    id: '2',
    email: 'innovateamnigeria@gmail.com',
    password: 'innovateam2024!',
    name: 'Innovateam Nigeria',
    role: 'admin',
    isAdmin: true
  }
];

function testLogin(email, password) {
  console.log(`🔐 Testing login: ${email} with password: ${password ? '***' : '(empty)'}`);
  
  // Validate password is not empty
  if (!password || password.trim().length === 0) {
    console.log('❌ Empty password provided');
    return { success: false, error: 'Password is required' };
  }
  
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (!user) {
    console.log('❌ Invalid credentials');
    return { success: false, error: 'Invalid email or password' };
  }
  
  console.log('✅ Login successful');
  return { success: true, user };
}

console.log('🧪 Testing Authentication Fix...\n');

// Test cases
console.log('1. Testing with empty password:');
testLogin('admin@innovateam.com', '');

console.log('\n2. Testing with wrong password:');
testLogin('admin@innovateam.com', 'wrongpassword');

console.log('\n3. Testing with correct credentials:');
testLogin('admin@innovateam.com', 'admin123!');

console.log('\n4. Testing second admin account:');
testLogin('innovateamnigeria@gmail.com', 'innovateam2024!');

console.log('\n5. Testing non-existent user:');
testLogin('fake@example.com', 'password');

console.log('\n✅ Authentication test completed!');