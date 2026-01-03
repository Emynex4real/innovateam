const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Path to users file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Function to verify the users file
const verifyUsersFile = async () => {
  try {
    console.log('🔍 Verifying users file...');
    
    // Check if file exists
    if (!fs.existsSync(usersFilePath)) {
      console.error('❌ Error: users.json file does not exist');
      return false;
    }
    
    // Read the file
    const fileContent = fs.readFileSync(usersFilePath, 'utf8');
    console.log('📄 File content:', fileContent);
    
    // Try to parse the JSON
    let users;
    try {
      users = JSON.parse(fileContent);
    } catch (error) {
      console.error('❌ Error parsing users.json:', error.message);
      return false;
    }
    
    // Check if it's an array
    if (!Array.isArray(users)) {
      console.error('❌ Error: users.json does not contain an array');
      return false;
    }
    
    console.log(`✅ Found ${users.length} user(s) in the file`);
    
    // Log user details (safely, without password)
    users.forEach((user, index) => {
      console.log(`\n👤 User #${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || 'user'}`);
      console.log(`   isAdmin: ${!!user.isAdmin}`);
      console.log(`   Has password: ${!!user.password}`);
      console.log(`   Password length: ${user.password ? user.password.length : 0}`);
      console.log(`   Is valid bcrypt hash: ${user.password ? (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) : 'No password'}`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying users file:', error);
    return false;
  }
};

// Run the verification
verifyUsersFile().then(success => {
  if (success) {
    console.log('\n✅ Verification completed successfully');
  } else {
    console.log('\n❌ Verification failed');
    process.exit(1);
  }
});
