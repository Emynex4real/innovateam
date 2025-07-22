const http = require('http');

// Test data
const postData = JSON.stringify({
  email: 'admin@example.com',
  password: 'admin123'
});

// Options for the HTTP request
const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Make the request
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('BODY:', JSON.parse(data));
    
    // If login was successful, test the transactions endpoint
    if (res.statusCode === 200) {
      const response = JSON.parse(data);
      if (response.token) {
        testTransactionsEndpoint(response.token);
      }
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();

function testTransactionsEndpoint(token) {
  console.log('\nTesting transactions endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: '/api/admin/transactions',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`\nTRANSACTIONS STATUS: ${res.statusCode}`);
    console.log('TRANSACTIONS HEADERS:', JSON.stringify(res.headers, null, 2));
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        console.log('TRANSACTIONS BODY:', JSON.parse(data));
      } catch (e) {
        console.log('TRANSACTIONS BODY:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`problem with transactions request: ${e.message}`);
  });
  
  req.end();
}
