const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Create admin user with hashed password
const createAdminUser = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  return {
    id: Date.now().toString(),
    name: 'Admin User',
    email: 'admin@example.com',
    phoneNumber: '1234567890',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  };
};

// Main function
const main = async () => {
  try {
    const usersFilePath = path.join(__dirname, '../data/users.json');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(path.dirname(usersFilePath))) {
      fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
    }
    
    // Create admin user
    const adminUser = await createAdminUser();
    
    // Write to file with proper formatting
    fs.writeFileSync(
      usersFilePath,
      JSON.stringify([adminUser], null, 2),
      'utf8'
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
main();
