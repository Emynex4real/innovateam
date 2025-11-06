const http = require('http');

console.log('=== Self-Request Test ===');
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

// Start the server on port 3007
const PORT = 3007;
server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n=== Server Started ===`);
    console.log(`Server is running at: http://127.0.0.1:${PORT}`);
    
    // Make a request to the server from within the same process
    console.log('\n=== Making Request to Server ===');
    const req = http.request(
        {
            hostname: '127.0.0.1',
            port: PORT,
            path: '/test',
            method: 'GET',
            headers: {
                'User-Agent': 'Self-Request-Test'
            }
        },
        (res) => {
            console.log('\n=== Client: Received Response ===');
            console.log('Status Code:', res.statusCode);
            console.log('Headers:', res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('Response Body:', data);
                console.log('\n=== Test Complete ===');
                server.close(() => {
                    console.log('Server closed');
                    process.exit(0);
                });
            });
        }
    );
    
    req.on('error', (error) => {
        console.error('Request error:', error);
        server.close();
        process.exit(1);
    });
    
    req.end();
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

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server has been stopped');
        process.exit(0);
    });
});
