const http = require('http');

console.log('=== HTTP Client ===');
console.log('Node.js version:', process.version);

// Server details
const PORT = 3008;
const HOST = '127.0.0.1';

console.log(`\n=== Making Request to Server ===`);
console.log(`URL: http://${HOST}:${PORT}/test`);

const req = http.request(
    {
        hostname: HOST,
        port: PORT,
        path: '/test',
        method: 'GET',
        headers: {
            'User-Agent': 'Test-Client',
            'Accept': 'application/json'
        }
    },
    (res) => {
        console.log('\n=== Response Received ===');
        console.log('Status Code:', res.statusCode);
        console.log('Status Message:', res.statusMessage);
        console.log('Headers:', JSON.stringify(res.headers, null, 2));
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response Body:', data);
            console.log('\n=== Test Complete ===');
        });
    }
);

// Handle request errors
req.on('error', (error) => {
    console.error('Request failed:', {
        code: error.code,
        message: error.message,
        stack: error.stack
    });
});

// Send the request
req.end();
