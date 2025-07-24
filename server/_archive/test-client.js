const http = require('http');

console.log('=== HTTP Client Test ===');
console.log('Node.js version:', process.version);

// Server details
const PORT = 3008;
const HOST = '127.0.0.1';

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    console.log(`\n=== Server: Received Request ===`);
    console.log('Time:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        status: 'success',
        message: 'Hello from the server!',
        timestamp: new Date().toISOString()
    }));
});

// Start the server
server.listen(PORT, HOST, () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Server is running at: http://${HOST}:${PORT}`);
    console.log('Process ID:', process.pid);
    
    // Keep the server running
    console.log('\nServer is running. Keep this process alive to test with the client.');
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', {
        code: error.code,
        message: error.message,
        stack: error.stack
    });
    process.exit(1);
});
