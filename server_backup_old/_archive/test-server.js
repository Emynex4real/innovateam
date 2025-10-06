const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/test' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Server is running!', time: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// Start the server on port 5001
const PORT = 5001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server is running on http://localhost:${PORT}/test`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});
