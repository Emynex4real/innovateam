const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

async function updateAdminPassword() {
  try {
    // Read existing users
    const data = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(data);
    
    // Find admin user
    const adminUser = users.find(u => u.email === ADMIN_EMAIL);
    if (!adminUser) {
      console.error('Admin user not found');
      process.exit(1);
    }
    
    // Generate new hash
    console.log('Generating new bcrypt hash for admin password...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(ADMIN_PASSWORD, salt);
    
    // Update password
    adminUser.password = hash;
    
    // Save back to file
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    
    console.log('✅ Successfully updated admin password hash');
    console.log('New hash:', hash);
    console.log('Hash length:', hash.length);
    console.log('Starts with $2a$:', hash.startsWith('$2a$'));
    
  } catch (error) {
    console.error('Error updating admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword();
