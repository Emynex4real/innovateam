// Simple test script to verify admin functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test admin endpoints
async function testAdminEndpoints() {
  console.log('Testing admin endpoints...\n');

  try {
    // Test stats endpoint
    console.log('1. Testing /admin/stats...');
    const statsResponse = await axios.get(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Authorization': 'Bearer test-token' // You'll need a real token
      }
    });
    console.log('Stats response:', statsResponse.data);
    console.log('✅ Stats endpoint working\n');

    // Test users endpoint
    console.log('2. Testing /admin/users...');
    const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': 'Bearer test-token' // You'll need a real token
      }
    });
    console.log('Users response:', usersResponse.data);
    console.log('✅ Users endpoint working\n');

    // Test transactions endpoint
    console.log('3. Testing /admin/transactions...');
    const transactionsResponse = await axios.get(`${API_BASE_URL}/admin/transactions`, {
      headers: {
        'Authorization': 'Bearer test-token' // You'll need a real token
      }
    });
    console.log('Transactions response:', transactionsResponse.data);
    console.log('✅ Transactions endpoint working\n');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test without authentication to see error handling
async function testWithoutAuth() {
  console.log('Testing endpoints without authentication...\n');

  try {
    const response = await axios.get(`${API_BASE_URL}/admin/stats`);
    console.log('Unexpected success:', response.data);
  } catch (error) {
    console.log('✅ Properly rejected without auth:', error.response?.status, error.response?.data);
  }
}

// Run tests
console.log('🧪 Admin API Test Suite\n');
console.log('='.repeat(50));

testWithoutAuth().then(() => {
  console.log('\n' + '='.repeat(50));
  // Uncomment the line below and add a real token to test authenticated endpoints
  // testAdminEndpoints();
});