const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

async function generateHash() {
  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    
    console.log('Generated hash:', hash);
    console.log('Hash length:', hash.length);
    
    // Update the users.json file
    const usersPath = path.join(__dirname, 'data', 'users.json');
    const usersData = JSON.parse(await fs.readFile(usersPath, 'utf8'));
    
    // Update the admin user's password
    const updatedUsers = usersData.map(user => {
      if (user.email === 'admin@example.com') {
        return { ...user, password: hash };
      }
      return user;
    });
    
    // Write the updated users back to the file
    await fs.writeFile(usersPath, JSON.stringify(updatedUsers, null, 2));
    console.log('Successfully updated users.json with new hash');
    
  } catch (error) {
    console.error('Error generating hash:', error);
    process.exit(1);
  }
}

generateHash();
