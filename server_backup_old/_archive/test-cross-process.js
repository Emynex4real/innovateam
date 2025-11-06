const { exec } = require('child_process');
const path = require('path');
const http = require('http');

console.log('=== Cross-Process Server Test ===');
console.log('Node.js version:', process.version);

// Start a simple HTTP server in a separate process
const serverScript = `
const http = require('http');
const server = http.createServer((req, res) => {
    console.log('\\n=== Server: Received Request ===');
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

const PORT = 3011;
server.listen(PORT, '127.0.0.1', () => {
    console.log('Server started on port', PORT);
    // Keep the process alive
    setInterval(() => {}, 1000);
});
`;

// Write the server script to a temporary file
const fs = require('fs');
const serverFilePath = path.join(__dirname, 'temp-server.js');
fs.writeFileSync(serverFilePath, serverScript);

console.log('Starting server in a separate process...');
const serverProcess = exec(`node ${serverFilePath}`, (error, stdout, stderr) => {
    if (error) {
        console.error('Server process error:', error);
    }
    if (stderr) {
        console.error('Server stderr:', stderr);
    }
    console.log('Server stdout:', stdout);
});

// Capture server output
serverProcess.stdout.on('data', (data) => {
    console.log(`[Server] ${data}`);
    
    // Once the server starts, make a request to it
    if (data.includes('Server started on port')) {
        console.log('\n=== Making Request to Server ===');
        
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port: 3011,
                path: '/test',
                method: 'GET',
                timeout: 3000
            },
            (res) => {
                console.log('\n=== Response Received ===');
                console.log('Status Code:', res.statusCode);
                
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log('Response Body:', data);
                    console.log('\n=== Test Successful ===');
                    serverProcess.kill();
                    try {
                        fs.unlinkSync(serverFilePath);
                    } catch (e) {}
                    process.exit(0);
                });
            }
        );
        
        req.on('error', (error) => {
            console.error('Request failed:', {
                code: error.code,
                message: error.message
            });
            serverProcess.kill();
            try {
                fs.unlinkSync(serverFilePath);
            } catch (e) {}
            process.exit(1);
        });
        
        req.on('timeout', () => {
            console.error('Request timed out');
            req.destroy();
            serverProcess.kill();
            try {
                fs.unlinkSync(serverFilePath);
            } catch (e) {}
            process.exit(1);
        });
        
        req.end();
    }
});

serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data}`);});

// Clean up on exit
process.on('exit', () => {
    serverProcess.kill();
    try {
        fs.unlinkSync(serverFilePath);
    } catch (e) {}
});

// Set a timeout to prevent hanging
setTimeout(() => {
    console.error('Test timed out');
    serverProcess.kill();
    try {
        fs.unlinkSync(serverFilePath);
    } catch (e) {}
    process.exit(1);
}, 10000);
