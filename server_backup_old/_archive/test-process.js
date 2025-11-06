const { exec } = require('child_process');

console.log('=== Process Test ===');
console.log('Node.js version:', process.version);

// Simple command to run in a separate process
const command = 'node -e "console.log(\'Hello from child process!\'); process.exit(0);"';

console.log('\n=== Executing Command in Child Process ===');
console.log('Command:', command);

const child = exec(command);

child.stdout.on('data', (data) => {
    console.log(`[Child Process] ${data}`);
});

child.stderr.on('data', (data) => {
    console.error(`[Child Process Error] ${data}`);
});

child.on('close', (code) => {
    console.log(`\n=== Child Process Exited ===`);
    console.log('Exit Code:', code);
    process.exit(code);
});

// Set a timeout to prevent hanging
setTimeout(() => {
    console.error('Test timed out');
    child.kill();
    process.exit(1);
}, 5000);
