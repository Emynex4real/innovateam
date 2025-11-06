const http = require('http');

console.log('=== HTTP Client Test ===');
console.log('Node.js version:', process.version);

// Server details
const PORT = 3010;
const HOST = '127.0.0.1';

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    console.log(`\n=== Server: Received Request ===`);
    console.log('Time:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    
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
    
    // Make a request to the server
    console.log('\n=== Making HTTP Request ===');
    const req = http.request(
        {
            hostname: HOST,
            port: PORT,
            path: '/test',
            method: 'GET',
            headers: {
                'User-Agent': 'Test-HTTP-Client',
                'Accept': 'application/json'
            }
        },
        (res) => {
            console.log('\n=== Response Received ===');
            console.log('Status Code:', res.statusCode);
            console.log('Status Message:', res.statusMessage);
            console.log('Headers:', res.headers);
            
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log('Response Body:', data);
                console.log('\n=== Test Complete ===');
                server.close();
                process.exit(0);
            });
        }
    );
    
    req.on('error', (error) => {
        console.error('Request failed:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
        process.exit(1);
    });
    
    // Send the request
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

// Set a timeout to prevent hanging
setTimeout(() => {
    console.error('Test timed out');
    process.exit(1);
}, 5000);
