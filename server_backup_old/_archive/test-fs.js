const fs = require('fs');
const path = require('path');

console.log('=== File System Test ===');
console.log('Node.js version:', process.version);
console.log('Current directory:', process.cwd());

const testFilePath = path.join(__dirname, 'test-file.txt');
const testContent = 'This is a test file created at ' + new Date().toISOString();

// Write to a file
fs.writeFile(testFilePath, testContent, (err) => {
    if (err) {
        console.error('Error writing to file:', err);
        return;
    }
    
    console.log('Successfully wrote to file:', testFilePath);
    
    // Read the file back
    fs.readFile(testFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        
        console.log('File content:', data);
        
        // Delete the test file
        fs.unlink(testFilePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return;
            }
            console.log('Test file deleted successfully');
        });
    });
});
