console.log('Hello, World!');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

// Keep the process alive for a while
setTimeout(() => {
    console.log('Exiting after 30 seconds...');
}, 30000);
