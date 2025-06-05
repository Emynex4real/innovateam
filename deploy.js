const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = require('./package.json');

// Function to update homepage based on environment
function updateHomepage(isProduction) {
  packageJson.homepage = isProduction 
    ? 'https://emynex4real.github.io/innovateam'
    : '.';

  // Write back to package.json
  fs.writeFileSync(
    path.join(__dirname, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// Check if we're deploying
if (process.argv.includes('--deploy')) {
  updateHomepage(true);
  console.log('Updated homepage for production deployment');
} else {
  updateHomepage(false);
  console.log('Updated homepage for local development');
} 