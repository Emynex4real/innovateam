const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = require('./package.json');

// Function to update homepage and port based on environment
function updateConfig(isProduction) {
  // Update homepage
  packageJson.homepage = isProduction ? '.' : '.';

  // Set PORT from environment or default
  const port = process.env.PORT || (isProduction ? 80 : 3000); // Default 3000 for dev, 80 for prod
  process.env.PORT = port; // Set for Craco to use
  console.log(`Setting PORT to ${port} for ${isProduction ? 'production' : 'local development'}`);

  // Write back to package.json
  fs.writeFileSync(
    path.join(__dirname, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// Check if we're deploying
if (process.argv.includes('--deploy')) {
  updateConfig(true);
  console.log('Updated homepage for production deployment');
} else {
  updateConfig(false);
  console.log('Updated homepage for local development');
}