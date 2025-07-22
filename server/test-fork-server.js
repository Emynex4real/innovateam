const { fork } = require('child_process');
const path = require('path');
const http = require('http');

console.log('=== Fork Server Test ===');
console.log('Node.js version:', process.version);

// Path to the server script
const serverScriptPath = path.join(__dirname, 'fork-server-worker.js');

// Create a simple server script
const serverScript = `
const http = require('http');

const server = http.createServer((req, res) => {
    console.log('\\n=== Server: Received Request ===');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from the forked server!');
});

const PORT = 3013;
server.listen(PORT, '127.0.0.1', () => {
    console.log('Forked server running at http://127.0.0.1:' + PORT);
    // Send ready message to parent
    if (process.send) {
        process.send({ type: 'ready', port: PORT });
    }
});
`;

// Write the server script to a file
const fs = require('fs');
fs.writeFileSync(serverScriptPath, serverScript);

console.log('Starting server with fork...');
const serverProcess = fork(serverScriptPath, [], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
});

// Handle messages from the forked process
serverProcess.on('message', (message) => {
    if (message.type === 'ready') {
        console.log('\n=== Making Request to Forked Server ===');
        
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port: message.port,
                path: '/',
                method: 'GET',
                timeout: 3000
            },
            (res) => {
                console.log('\n=== Response Received ===');
                console.log('Status Code:', res.statusCode);
                
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    console.log('Response Body:', responseData);
                    console.log('\n=== Test Successful ===');
                    cleanup();
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
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
    console.log(`[Server] ${data}`);
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

// Cleanup function
function cleanup(exitCode = 0) {
    // Kill the server process if it's still running
    if (serverProcess && !serverProcess.killed) {
        serverProcess.kill();
    }
    
    // Remove the temporary server script
    try {
        fs.unlinkSync(serverScriptPath);
    } catch (e) {
        console.error('Error removing temporary file:', e.message);
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
}, 10000);
