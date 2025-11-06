const fs = require('fs');
const path = require('path');

// Path to users file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Create a properly formatted admin user
const adminUser = {
  id: `admin_${Date.now()}`,
  name: 'Admin User',
  email: 'admin@example.com',
  phoneNumber: '1234567890',
  password: '$2a$10$Hbi5Pp8KBD2EUa8pBOhSmMWys1erFgoPjePPTFIWy2RNNsJoC',
  role: 'admin',
  isAdmin: true,
  createdAt: new Date().toISOString()
};

// Create the users array
const users = [adminUser];

// Convert to JSON string with proper formatting
const jsonString = JSON.stringify(users, null, 2);

// Ensure directory exists
const dir = path.dirname(usersFilePath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write to file
fs.writeFileSync(usersFilePath, jsonString, 'utf8');

console.log('✅ Successfully created users.json with admin user:');
console.log('File location:', usersFilePath);
console.log('\nFile content:');
console.log('------------');
console.log(jsonString);
console.log('------------');

// Verify the JSON is valid
try {
  JSON.parse(jsonString);
  console.log('✅ JSON is valid');
} catch (e) {
  console.error('❌ Invalid JSON:', e.message);
}
