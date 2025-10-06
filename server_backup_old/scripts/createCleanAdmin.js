const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Path to users file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Create clean admin user
const adminUser = {
  id: Date.now().toString(),
  name: 'Admin User',
  email: 'admin@example.com',
  phoneNumber: '1234567890',
  password: bcrypt.hashSync('admin123', 10),
  role: 'admin',
  createdAt: new Date().toISOString()
};

// Create empty users array with admin user
const users = [adminUser];

// Write to file
fs.writeFileSync(
  usersFilePath,
  JSON.stringify(users, null, 2),
  'utf8'
);

console.log('✅ Created clean admin user:');
console.log('Email: admin@example.com');
console.log('Password: admin123');
