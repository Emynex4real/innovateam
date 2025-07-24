const { fork } = require('child_process');
const path = require('path');
const http = require('http');

console.log('=== Main Server Test ===');
console.log('Node.js version:', process.version);

// Path to the main server script
const serverScriptPath = path.join(__dirname, 'server.js');

// Check if server.js exists
const fs = require('fs');
if (!fs.existsSync(serverScriptPath)) {
    console.error('Error: server.js not found at', serverScriptPath);
    process.exit(1);
}

console.log('Starting main server with fork...');
const serverProcess = fork(serverScriptPath, [], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    env: { ...process.env, PORT: '5002' } // Use a different port to avoid conflicts
});

// Handle messages from the forked process
serverProcess.on('message', (message) => {
    console.log('Message from server:', message);
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Server] ${output}`);
    
    // Look for server start message
    if (output.includes('Server is running on port')) {
        const port = output.match(/port (\d+)/)?.[1] || '5002';
        console.log(`\n=== Making Request to Main Server ===`);
        
        // Give the server a moment to fully start
        setTimeout(() => {
            testServerConnection(port);
        }, 1000);
    }
});

// Handle server errors
serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data}`);
});

serverProcess.on('error', (error) => {
    console.error('Failed to start server process:', error);
    cleanup(1);
});

serverProcess.on('exit', (code, signal) => {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
    cleanup(code || 0);
});

// Function to test server connection
function testServerConnection(port) {
    console.log(`Testing connection to http://127.0.0.1:${port}/api/health`);
    
    const req = http.request(
        {
            hostname: '127.0.0.1',
            port: port,
            path: '/api/health',
            method: 'GET',
            timeout: 5000
        },
        (res) => {
            console.log('\n=== Response Received ===');
            console.log('Status Code:', res.statusCode);
            console.log('Headers:', JSON.stringify(res.headers, null, 2));
            
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log('Response Body:', responseData);
                console.log('\n=== Test Complete ===');
                cleanup(0);
            });
        }
    );
    
    req.on('error', (error) => {
        console.error('Request failed:', error.message);
        cleanup(1);
    });
    
    req.on('timeout', () => {
        console.error('Request timed out');
        req.destroy();
        cleanup(1);
    });
    
    req.end();
}

// Cleanup function
function cleanup(exitCode = 0) {
    // Kill the server process if it's still running
    if (serverProcess && !serverProcess.killed) {
        serverProcess.kill();
    }
    
    // Only exit if we're still in the main process
    if (process.exitCode === undefined) {
        process.exit(exitCode);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Cleaning up...');
    cleanup();
});

// Set a timeout to prevent hanging
setTimeout(() => {
    console.error('Test timed out');
    cleanup(1);
}, 30000);
