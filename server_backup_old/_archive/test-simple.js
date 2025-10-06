const http = require('http');
const os = require('os');

console.log('=== Starting Simple HTTP Server Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, os.release());
console.log('Current directory:', process.cwd());

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    console.log(`\n=== New Request ===`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log('Headers:', req.headers);
    
    // Simple response
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
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

// Start the server on port 3003
const PORT = 3003;
server.listen(PORT, '127.0.0.1', () => {
    const address = server.address();
    console.log('\n=== Server Started ===');
    console.log('Server is running at:', {
        address: address.address,
        port: address.port,
        family: address.family,
        url: `http://${address.address}:${address.port}`
    });
    
    console.log('\nTest the server by opening this URL in your browser:');
    console.log(`http://localhost:${PORT}/`);
    
    // Log open handles to see what's keeping the process alive
    console.log('\nActive handles:');
    process._getActiveHandles().forEach((h, i) => {
        console.log(`  ${i + 1}.`, h.constructor.name);
    });
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server has been stopped');
        process.exit(0);
    });
});

console.log('=== Test Script Loaded ===');
