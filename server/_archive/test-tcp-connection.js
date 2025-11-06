const net = require('net');

console.log('=== TCP Connection Test ===');
console.log('Node.js version:', process.version);

// Test connecting to a known working service (Google DNS)
const TEST_HOST = '8.8.8.8'; // Google DNS
const TEST_PORT = 53; // DNS port

console.log(`\n=== Testing TCP Connection to ${TEST_HOST}:${TEST_PORT} ===`);

const socket = net.createConnection({
    host: TEST_HOST,
    port: TEST_PORT,
    timeout: 5000 // 5 second timeout
});

socket.on('connect', () => {
    console.log('Successfully established TCP connection!');
    console.log('Local address:', socket.localAddress, 'port', socket.localPort);
    console.log('Remote address:', socket.remoteAddress, 'port', socket.remotePort);
    socket.end();
    process.exit(0);
});

socket.on('error', (err) => {
    console.error('TCP connection failed:', {
        code: err.code,
        message: err.message,
        stack: err.stack
    });
    process.exit(1);
});

socket.on('timeout', () => {
    console.error('TCP connection timed out');
    socket.destroy();
    process.exit(1);
});

console.log('Attempting to establish TCP connection...');
