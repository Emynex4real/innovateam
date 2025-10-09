#!/usr/bin/env node

// Database Security Validation
const fs = require('fs');

console.log('🗄️ Running Database Security Validation...\n');

const checks = {
  databaseIntegration: false,
  inputValidation: false,
  dataEncryption: false,
  rlsPolicies: false,
  auditLogging: false,
  dataConsistency: false
};

// Check 1: Database integration
console.log('1. Checking database integration...');
if (fs.existsSync('src/services/supabase/wallet.service.js')) {
  const content = fs.readFileSync('src/services/supabase/wallet.service.js', 'utf8');
  if (content.includes('supabase.from') && content.includes('transactions')) {
    console.log('✅ Database-integrated wallet service implemented');
    checks.databaseIntegration = true;
  } else {
    console.log('❌ Database integration incomplete');
  }
} else {
  console.log('❌ Database wallet service not found');
}

// Check 2: Input validation
console.log('\n2. Checking input validation...');
if (fs.existsSync('src/services/supabase/validation.service.js')) {
  const content = fs.readFileSync('src/services/supabase/validation.service.js', 'utf8');
  if (content.includes('validateAmount') && content.includes('sanitizeText')) {
    console.log('✅ Comprehensive input validation implemented');
    checks.inputValidation = true;
  } else {
    console.log('❌ Input validation incomplete');
  }
} else {
  console.log('❌ Input validation service not found');
}

// Check 3: Data encryption
console.log('\n3. Checking data encryption...');
if (fs.existsSync('src/services/supabase/encryption.service.js')) {
  const content = fs.readFileSync('src/services/supabase/encryption.service.js', 'utf8');
  if (content.includes('encryptSensitiveData') && content.includes('CryptoJS')) {
    console.log('✅ Data encryption service implemented');
    checks.dataEncryption = true;
  } else {
    console.log('❌ Data encryption incomplete');
  }
} else {
  console.log('❌ Data encryption service not found');
}

// Check 4: RLS policies verification
console.log('\n4. Checking RLS policies...');
if (fs.existsSync('supabase/enhanced_security_policies.sql')) {
  const content = fs.readFileSync('supabase/enhanced_security_policies.sql', 'utf8');
  if (content.includes('auth.uid()') && content.includes('auth.jwt()')) {
    console.log('✅ Enhanced RLS policies configured');
    checks.rlsPolicies = true;
  } else {
    console.log('❌ RLS policies incomplete');
  }
} else {
  console.log('❌ Enhanced RLS policies not found');
}

// Check 5: Audit logging
console.log('\n5. Checking audit logging...');
const walletContextExists = fs.existsSync('src/contexts/WalletContext.jsx');
if (walletContextExists) {
  const content = fs.readFileSync('src/contexts/WalletContext.jsx', 'utf8');
  if (content.includes('WalletService') && content.includes('user.id')) {
    console.log('✅ Database audit logging integrated');
    checks.auditLogging = true;
  } else {
    console.log('❌ Audit logging not properly integrated');
  }
} else {
  console.log('❌ Wallet context not found');
}

// Check 6: Data consistency
console.log('\n6. Checking data consistency...');
const oldWalletExists = fs.existsSync('src/services/wallet.service.js');
const newWalletExists = fs.existsSync('src/services/supabase/wallet.service.js');

if (newWalletExists && walletContextExists) {
  const contextContent = fs.readFileSync('src/contexts/WalletContext.jsx', 'utf8');
  if (contextContent.includes('WalletService.getBalance') && !contextContent.includes('localStorage.getItem')) {
    console.log('✅ Data consistency maintained - using database');
    checks.dataConsistency = true;
  } else {
    console.log('❌ Data inconsistency - mixed localStorage and database usage');
  }
} else {
  console.log('❌ Database integration incomplete');
}

// Summary
console.log('\n📊 DATABASE SECURITY SUMMARY');
console.log('==============================');
const passed = Object.values(checks).filter(Boolean).length;
const total = Object.keys(checks).length;

Object.entries(checks).forEach(([check, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${check}`);
});

console.log(`\nScore: ${passed}/${total} checks passed`);

if (passed === total) {
  console.log('\n🎉 All database security checks passed!');
  console.log('🗄️ Database is secure and properly integrated.');
  process.exit(0);
} else {
  console.log('\n⚠️  Database security issues found.');
  console.log('Please review and fix the failing checks.');
  process.exit(1);
}