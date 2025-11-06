const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with admin credentials...');
    
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response data:', response.data);
    
    // If login is successful, test the transactions endpoint
    if (response.data && response.data.token) {
      console.log('\nTesting transactions endpoint...');
      const transactionsResponse = await axios.get('http://localhost:5001/api/admin/transactions', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      console.log('Transactions retrieved successfully!');
      console.log('Transactions data:', transactionsResponse.data);
    }
    
  } catch (error) {
    console.error('Test failed:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
  }
}

testLogin();
