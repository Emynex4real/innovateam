const net = require('net');
const dns = require('dns');
const os = require('os');

console.log('=== Network Diagnostics ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, os.release());
console.log('Current directory:', process.cwd());
console.log('Network interfaces:', JSON.stringify(os.networkInterfaces(), null, 2));

// Test DNS resolution
dns.lookup('localhost', (err, address, family) => {
    console.log('\n=== DNS Test ===');
    if (err) {
        console.error('DNS lookup failed:', err);
    } else {
        console.log(`localhost resolves to ${address} (IPv${family})`);
    }
});

// Test TCP connection to itself
const testPort = 3005;
const testServer = net.createServer((socket) => {
    console.log('\n=== TCP Connection Test: Server Received Connection ===');
    socket.on('data', (data) => {
        console.log('Server received:', data.toString().trim());
        socket.write('Echo: ' + data);
    });
    
    socket.on('error', (err) => {
        console.error('Server socket error:', err);
    });
});

testServer.on('error', (err) => {
    console.error('Test server error:', err);
});

// Start the test server
testServer.listen(testPort, '127.0.0.1', () => {
    console.log(`\n=== TCP Server Started on port ${testPort} ===`);
    
    // Test connecting to the server
    const client = net.createConnection({ port: testPort, host: '127.0.0.1' }, () => {
        console.log('=== TCP Client Connected ===');
        client.write('Hello, server!');
    });
    
    client.on('data', (data) => {
        console.log('Client received:', data.toString().trim());
        console.log('TCP connection test successful!');
        client.end();
        testServer.close(() => {
            console.log('Test server closed');
        });
    });
    
    client.on('error', (err) => {
        console.error('Client socket error:', err);
        testServer.close();
    });
});

// Keep the process alive for a while
setTimeout(() => {
    console.log('\n=== Network Diagnostics Complete ===');
    process.exit(0);
}, 10000);
