const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// User data
const adminUser = {
  id: Date.now().toString(),
  name: 'Admin User',
  email: 'admin@example.com',
  phoneNumber: '1234567890',
  password: bcrypt.hashSync('admin123', 10),
  role: 'admin',
  createdAt: new Date().toISOString()
};

// Path to users file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Create empty users array if file doesn't exist
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, '[]', 'utf8');
}

// Read existing users
let users = [];
try {
  const data = fs.readFileSync(usersFilePath, 'utf8');
  users = JSON.parse(data);
} catch (error) {
  console.error('Error reading users file:', error);
  process.exit(1);
}

// Check if admin already exists
const adminExists = users.some(user => user.role === 'admin');

if (!adminExists) {
  // Add admin user
  users.push(adminUser);
  
  // Save back to file
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error saving admin user:', error);
    process.exit(1);
  }
} else {
  console.log('ℹ️ Admin user already exists');
}
