require('dotenv').config();
const axios = require('axios');

async function testWallet() {
  try {
    // First login to get token
    console.log('Testing wallet funding...');
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token:', token.slice(0, 20) + '...');
    
    // Test wallet balance
    const balanceResponse = await axios.get('http://localhost:5000/api/wallet/balance', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Current balance:', balanceResponse.data);
    
    // Test wallet funding
    const fundResponse = await axios.post('http://localhost:5000/api/wallet/fund', {
      amount: 1000,
      paymentMethod: 'card'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Funding result:', fundResponse.data);
    
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
}

testWallet();