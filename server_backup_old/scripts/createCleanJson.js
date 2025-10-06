const fs = require('fs');
const path = require('path');

// Path to users file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Create a properly formatted JSON string
const createJsonString = () => {
  return `[
  {
    "id": "${Date.now()}",
    "name": "Admin User",
    "email": "admin@example.com",
    "phoneNumber": "1234567890",
    "password": "$2a$10$Hbi5Pp8KBD2EUa8pBOhSmMWys1erFgoPjePPTFIWy2RNNsJoC",
    "role": "admin",
    "isAdmin": true,
    "createdAt": "${new Date().toISOString()}"
  }
]`;
};

// Main function
const main = () => {
  try {
    // Ensure directory exists
    const dir = path.dirname(usersFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write directly to file
    const jsonString = createJsonString();
    fs.writeFileSync(usersFilePath, jsonString, 'utf8');
    
    console.log('✅ Created clean users.json file');
    console.log('File:', usersFilePath);
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    // Verify the file was written correctly
    const fileContent = fs.readFileSync(usersFilePath, 'utf8');
    console.log('\nFile content:');
    console.log('-------------');
    console.log(fileContent);
    console.log('-------------')
    
    // Try to parse to verify it's valid JSON
    JSON.parse(fileContent);
    console.log('✅ File is valid JSON');
    
  } catch (error) {
    console.error('❌ Error creating users.json:', error);
    process.exit(1);
  }
};

// Run the script
main();
