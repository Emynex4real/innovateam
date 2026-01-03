#!/usr/bin/env node

// Security validation script
const fs = require('fs');
const path = require('path');

console.log('🔒 Running Security Validation...\n');

const checks = {
  envFiles: false,
  hardcodedSecrets: false,
  dependencies: false,
  gitignore: false
};

// Check 1: Ensure no .env files with secrets
console.log('1. Checking environment files...');
const envFiles = ['.env', '.env.production', 'server_backup_old/.env'];
let hasSecrets = false;

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('sk-f713b5f4c3a64a61bb1e42ca6735a995') || 
        content.includes('djzbrnacgjzcyoxnhlip.supabase.co')) {
      console.log(`❌ ${file} contains compromised secrets!`);
      hasSecrets = true;
    }
  }
});

if (!hasSecrets) {
  console.log('✅ No compromised secrets found in env files');
  checks.envFiles = true;
}

// Check 2: Scan for hardcoded secrets in source
console.log('\n2. Scanning source code for hardcoded secrets...');
const sourceFiles = [
  'src/lib/supabase.js',
  'src/services/payment.service.js'
];

let foundHardcoded = false;
sourceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('djzbrnacgjzcyoxnhlip.supabase.co') || 
        content.includes('pk_test_your_key_here')) {
      console.log(`❌ ${file} contains hardcoded credentials!`);
      foundHardcoded = true;
    }
  }
});

if (!foundHardcoded) {
  console.log('✅ No hardcoded secrets found in source code');
  checks.hardcodedSecrets = true;
}

// Check 3: Verify package.json security updates
console.log('\n3. Checking dependency versions...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const secureVersions = {
  'axios': '1.7.9',
  '@supabase/supabase-js': '2.57.0'
};

let depsSecure = true;
Object.entries(secureVersions).forEach(([pkg, minVersion]) => {
  const currentVersion = packageJson.dependencies[pkg];
  if (!currentVersion || !currentVersion.includes(minVersion)) {
    console.log(`❌ ${pkg} needs update to ${minVersion} (current: ${currentVersion})`);
    depsSecure = false;
  }
});

if (depsSecure) {
  console.log('✅ Dependencies are up to date');
  checks.dependencies = true;
}

// Check 4: Verify .gitignore
console.log('\n4. Checking .gitignore...');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
if (gitignore.includes('.env') && gitignore.includes('*.key') && gitignore.includes('*.log')) {
  console.log('✅ .gitignore properly configured');
  checks.gitignore = true;
} else {
  console.log('❌ .gitignore missing security entries');
}

// Summary
console.log('\n📊 SECURITY VALIDATION SUMMARY');
console.log('================================');
const passed = Object.values(checks).filter(Boolean).length;
const total = Object.keys(checks).length;

Object.entries(checks).forEach(([check, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${check}`);
});

console.log(`\nScore: ${passed}/${total} checks passed`);

if (passed === total) {
  console.log('\n🎉 All security checks passed! Ready for Step 2.');
  process.exit(0);
} else {
  console.log('\n⚠️  Security issues found. Please fix before proceeding.');
  process.exit(1);
}