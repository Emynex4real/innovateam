const net = require('net');
const fs = require('fs');
const path = require('path');

console.log('=== Starting TCP Server Test ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, require('os').release());
console.log('Current directory:', process.cwd());

// Create a simple TCP server
const server = net.createServer((socket) => {
    console.log('\n=== New Connection ===');
    console.log('Time:', new Date().toISOString());
    console.log('Remote address:', socket.remoteAddress, 'port', socket.remotePort);
    
    // Handle incoming data
    socket.on('data', (data) => {
        console.log('Received data:', data.toString().trim());
        // Echo the data back to the client
        socket.write('Echo: ' + data);
    });
    
    // Handle client disconnection
    socket.on('end', () => {
        console.log('Client disconnected');
    });
    
    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
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

// Start the server on port 3004
const PORT = 3004;
server.listen(PORT, '127.0.0.1', () => {
    const address = server.address();
    console.log('\n=== TCP Server Started ===');
    console.log('Server is running at:', {
        address: address.address,
        port: address.port,
        family: address.family,
        url: `tcp://${address.address}:${address.port}`
    });
    
    console.log('\nTest the server using:');
    console.log(`1. telnet 127.0.0.1 ${PORT}`);
    console.log('2. Send any text and the server will echo it back');
    
    // Log open handles
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
