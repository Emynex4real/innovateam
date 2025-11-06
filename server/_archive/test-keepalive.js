console.log('=== Keep-Alive Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, require('os').release());
console.log('Current directory:', process.cwd());

// Create a simple HTTP server
const http = require('http');
const server = http.createServer((req, res) => {
    console.log(`\n=== New Request: ${new Date().toISOString()} ===`);
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    
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

// Start the server on port 3006
const PORT = 3006;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Server is running at: http://127.0.0.1:${PORT}`);
    console.log('Process ID:', process.pid);
    
    // Log open handles
    console.log('\nActive handles:');
    process._getActiveHandles().forEach((h, i) => {
        console.log(`  ${i + 1}.`, h.constructor.name);
    });
});

// Keep the process alive with a long interval
setInterval(() => {
    console.log(`[${new Date().toISOString()}] Process still alive...`);
}, 5000);

console.log('=== Test Script Loaded ===');
