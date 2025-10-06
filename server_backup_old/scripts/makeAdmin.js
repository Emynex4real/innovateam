// Script to make a user an admin
const users = require('../data/users.json');
const fs = require('fs');
const path = require('path');

const makeUserAdmin = (email) => {
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    console.error('User not found with email:', email);
    return false;
  }
  
  users[userIndex].role = 'admin';
  
  // Save updated users back to the file
  fs.writeFileSync(
    path.join(__dirname, '../data/users.json'),
    JSON.stringify(users, null, 2)
  );
  
  console.log(`User ${email} is now an admin`);
  return true;
};

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

makeUserAdmin(email);
