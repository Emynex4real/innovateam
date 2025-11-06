const http = require('http');
const { exec } = require('child_process');

console.log('=== Fetch API Test ===');
console.log('Node.js version:', process.version);

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

// Start the server on an available port
const PORT = 3009;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Server is running at: http://127.0.0.1:${PORT}`);
    
    // Use the fetch API to make a request to the server
    console.log('\n=== Making Request Using Fetch API ===');
    
    // Use node-fetch to make the request
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    
    fetch(`http://127.0.0.1:${PORT}/test`)
        .then(response => {
            console.log('Response Status:', response.status, response.statusText);
            console.log('Response Headers:', JSON.stringify([...response.headers.entries()]));
            return response.json();
        })
        .then(data => {
            console.log('Response Data:', data);
            console.log('\n=== Test Successful ===');
            process.exit(0);
        })
        .catch(error => {
            console.error('Fetch Error:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            process.exit(1);
        });
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

// Set a timeout to prevent hanging
setTimeout(() => {
    console.error('Test timed out');
    process.exit(1);
}, 10000);
