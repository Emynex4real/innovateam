const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Your email (replace with your actual email if different)
const YOUR_EMAIL = 'emynex4real@gmail.com';

// Path to users file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Create user data
const adminUser = {
  id: Date.now().toString(),
  name: 'Admin User',
  email: YOUR_EMAIL,
  phoneNumber: '1234567890',
  password: bcrypt.hashSync('admin123', 10),
  role: 'admin',
  createdAt: new Date().toISOString()
};

// Ensure users file exists
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

// Check if user already exists
const userIndex = users.findIndex(u => u.email === YOUR_EMAIL);

if (userIndex !== -1) {
  // Update existing user to admin
  users[userIndex].role = 'admin';
  users[userIndex].password = bcrypt.hashSync('admin123', 10);
  console.log('✅ Updated existing user to admin');
} else {
  // Add new admin user
  users.push(adminUser);
  console.log('✅ Created new admin user');
}

// Save back to file
try {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  console.log('✅ Admin user created/updated successfully!');
  console.log(`Email: ${YOUR_EMAIL}`);
  console.log('Password: admin123');
} catch (error) {
  console.error('Error saving admin user:', error);
  process.exit(1);
}
