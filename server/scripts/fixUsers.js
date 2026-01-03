const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Path to users file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Create a clean admin user
const createAdminUser = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  return [{
    id: Date.now().toString(),
    name: 'Admin User',
    email: 'admin@example.com',
    phoneNumber: '1234567890',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  }];
};

// Main function
const main = async () => {
  try {
    // Create admin user
    const users = await createAdminUser();
    
    // Write to file with proper formatting
    fs.writeFileSync(
      usersFilePath,
      JSON.stringify(users, null, 2),
      'utf8'
    );
    
    console.log('✅ Created clean admin user:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
main();
