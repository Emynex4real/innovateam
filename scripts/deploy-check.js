#!/usr/bin/env node

/**
 * Pre-deployment security and configuration check
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-deployment security check...\n');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message) {
  checks.push({ name, condition, message });
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}: ${message}`);
    failed++;
  }
}

// Check environment files
const envLocal = fs.existsSync('.env.local');
const envProduction = fs.existsSync('.env.production');
const envTemplate = fs.existsSync('.env');

check('Environment files', envLocal || envProduction, 'No .env.local or .env.production found');

// Check .gitignore
const gitignore = fs.existsSync('.gitignore') ? fs.readFileSync('.gitignore', 'utf8') : '';
check('.env files ignored', gitignore.includes('.env.local'), '.env.local not in .gitignore');

// Check package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
check('Build script exists', packageJson.scripts && packageJson.scripts.build, 'No build script in package.json');

// Check deployment configs
check('Vercel config', fs.existsSync('vercel.json'), 'vercel.json not found');
check('Render config', fs.existsSync('render.yaml'), 'render.yaml not found');

// Check for sensitive data in main .env
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  const hasSensitiveData = envContent.includes('supabase.co') || envContent.includes('eyJ');
  check('No sensitive data in .env', !hasSensitiveData, 'Sensitive data found in .env template');
}

// Check server configuration
const serverPath = path.join('server', 'server.js');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  check('CORS not wide open', !serverContent.includes('origin: true'), 'CORS allows all origins');
  check('Production auth check', serverContent.includes('NODE_ENV === \'production\''), 'No production auth validation');
}

// Check App.js
const appPath = path.join('src', 'App.js');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  check('Production Supabase check', appContent.includes('NODE_ENV === \'production\''), 'No production Supabase validation');
}

console.log(`\n📊 Security Check Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed > 0) {
  console.log('\n⚠️  Please fix the failed checks before deploying to production.');
  process.exit(1);
} else {
  console.log('\n🎉 All security checks passed! Ready for deployment.');
  process.exit(0);
}