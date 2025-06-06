const fs = require('fs');
const path = require('path');

// Check if we're in a CI environment (Vercel)
const isCI = process.env.CI === 'true';

// Only modify package.json if we're not in CI
if (!isCI) {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = require(packageJsonPath);

  // Only update homepage if it exists and we're not in CI
  if (packageJson.homepage) {
    packageJson.homepage = 'https://emynex4real.github.io/innovateam';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Updated homepage for production deployment');
  }
}

// Continue with the build process
console.log('Creating an optimized production build...'); 