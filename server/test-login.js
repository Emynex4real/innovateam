require('dotenv').config();
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    });
    
    console.log('Login successful:', response.data);
  } catch (error) {
    console.log('Login failed:', error.response?.data || error.message);
    
    // Try with different password
    try {
      const response2 = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'michaelbalogun34@gmail.com',
        password: 'password123'
      });
      console.log('Login successful with password123:', response2.data);
    } catch (error2) {
      console.log('Login failed with password123:', error2.response?.data || error2.message);
    }
  }
}

testLogin();