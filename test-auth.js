// Test script to verify backend authentication endpoints
const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');
    const userData = {
      name: 'Test User',
      email: `testuser_${Date.now()}@example.com`,
      password: 'Test@1234',
      phoneNumber: '1234567890'
    };

    const response = await axios.post(`${API_URL}/auth/register`, userData);
    console.log('Registration successful!');
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response.data;
  } catch (error) {
    console.error('Registration failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

// Run the test
(async () => {
  try {
    await testRegistration();
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();
