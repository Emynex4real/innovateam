const http = require('http');
const net = require('net');

console.log('Starting server diagnosis...');

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is already in use`);
          resolve(true);
        } else {
          console.error('Error checking port:', err);
          resolve(false);
        }
      })
      .once('listening', () => {
        tester.once('close', () => {
          console.log(`Port ${port} is available`);
          resolve(false);
        }).close();
      })
      .listen(port, '0.0.0.0');
  });
}

// Function to create a test server
async function createTestServer(port) {
  console.log(`\n=== Testing server on port ${port} ===`);
  
  // Check if port is available
  const portInUse = await isPortInUse(port);
  if (portInUse) {
    console.log(`Port ${port} is already in use, please free it up and try again`);
    return;
  }
  
  // Create HTTP server
  const server = http.createServer((req, res) => {
    console.log(`\n=== New Request ===`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);
    
    // Simple response
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'success',
      message: 'Test server is working!',
      port,
      timestamp: new Date().toISOString()
    }));
  });
  
  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
  });
  
  // Start listening
  server.listen(port, '0.0.0.0', () => {
    const address = server.address();
    console.log(`\nServer is running on:`, {
      address: address.address,
      port: address.port,
      family: address.family,
      url: `http://localhost:${address.port}`
    });
    
    console.log(`\nTest the server by opening this URL in your browser or using curl:`);
    console.log(`http://localhost:${address.port}/test`);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
      console.log('Server has been stopped');
      process.exit(0);
    });
  });
}

// Start the test server on port 3002
createTestServer(3002).catch(console.error);
