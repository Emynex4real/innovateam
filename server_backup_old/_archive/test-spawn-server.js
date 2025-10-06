const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

console.log('=== Spawn Server Test ===');
console.log('Node.js version:', process.version);

// Path to the server script
const serverScriptPath = path.join(__dirname, 'test-simple-server.js');

// Create a simple server script
const serverScript = `
const http = require('http');

const server = http.createServer((req, res) => {
    console.log('\\n=== Server: Received Request ===');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from the spawned server!');
});

const PORT = 3012;
server.listen(PORT, '127.0.0.1', () => {
    console.log('Spawned server running at http://127.0.0.1:' + PORT);
    // Keep the process alive
    setInterval(() => {}, 1000);
});
`;

// Write the server script to a file
const fs = require('fs');
fs.writeFileSync(serverScriptPath, serverScript);

console.log('Starting server with spawn...');
const serverProcess = spawn('node', [serverScriptPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true
});

// Handle server output
serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Server] ${output}`);
    
    // Once the server starts, make a request to it
    if (output.includes('Spawned server running at')) {
        console.log('\n=== Making Request to Spawned Server ===');
        
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port: 3012,
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

// Handle server errors
serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data}`);
});

serverProcess.on('error', (error) => {
    console.error('Failed to start server process:', error);
    cleanup(1);
});

serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
});

// Cleanup function
function cleanup(exitCode = 0) {
    // Kill the server process
    if (serverProcess && !serverProcess.killed) {
        serverProcess.kill();
    }
    
    // Remove the temporary server script
    try {
        fs.unlinkSync(serverScriptPath);
    } catch (e) {
        console.error('Error removing temporary file:', e.message);
    }
    
    process.exit(exitCode);
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
