const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'Server is running!', 
    port: 3001,
    time: new Date().toISOString() 
  }));
});

// Start the server on port 3001
const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server is running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});
