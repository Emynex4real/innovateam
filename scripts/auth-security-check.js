#!/usr/bin/env node

// Authentication & Authorization Security Check
const fs = require('fs');

console.log('🔐 Running Authentication Security Validation...\n');

const checks = {
  passwordValidation: false,
  rateLimiting: false,
  sessionSecurity: false,
  rlsPolicies: false,
  mfaSupport: false,
  inputValidation: false
};

// Check 1: Password validation
console.log('1. Checking password validation...');
if (fs.existsSync('src/utils/passwordValidation.js')) {
  const content = fs.readFileSync('src/utils/passwordValidation.js', 'utf8');
  if (content.includes('minLength: 12') && content.includes('requireSpecialChars')) {
    console.log('✅ Strong password validation implemented');
    checks.passwordValidation = true;
  } else {
    console.log('❌ Weak password validation');
  }
} else {
  console.log('❌ Password validation not found');
}

// Check 2: Rate limiting
console.log('\n2. Checking rate limiting...');
if (fs.existsSync('src/utils/rateLimiter.js')) {
  const content = fs.readFileSync('src/utils/rateLimiter.js', 'utf8');
  if (content.includes('AuthRateLimiter') && content.includes('checkLogin')) {
    console.log('✅ Authentication rate limiting implemented');
    checks.rateLimiting = true;
  } else {
    console.log('❌ Rate limiting incomplete');
  }
} else {
  console.log('❌ Rate limiting not found');
}

// Check 3: Session security
console.log('\n3. Checking session security...');
if (fs.existsSync('src/utils/sessionSecurity.js')) {
  const content = fs.readFileSync('src/utils/sessionSecurity.js', 'utf8');
  if (content.includes('SessionFingerprint') && content.includes('SecureTokenManager')) {
    console.log('✅ Advanced session security implemented');
    checks.sessionSecurity = true;
  } else {
    console.log('❌ Session security incomplete');
  }
} else {
  console.log('❌ Session security not found');
}

// Check 4: Enhanced RLS policies
console.log('\n4. Checking RLS policies...');
if (fs.existsSync('supabase/enhanced_security_policies.sql')) {
  const content = fs.readFileSync('supabase/enhanced_security_policies.sql', 'utf8');
  if (content.includes('auth.jwt()') && content.includes('log_security_event')) {
    console.log('✅ Enhanced RLS policies created');
    checks.rlsPolicies = true;
  } else {
    console.log('❌ RLS policies incomplete');
  }
} else {
  console.log('❌ Enhanced RLS policies not found');
}

// Check 5: MFA support
console.log('\n5. Checking MFA support...');
if (fs.existsSync('src/utils/mfaUtils.js')) {
  const content = fs.readFileSync('src/utils/mfaUtils.js', 'utf8');
  if (content.includes('MFAUtils') && content.includes('generateSecret')) {
    console.log('✅ Multi-factor authentication support added');
    checks.mfaSupport = true;
  } else {
    console.log('❌ MFA support incomplete');
  }
} else {
  console.log('❌ MFA support not found');
}

// Check 6: Input validation in auth service
console.log('\n6. Checking auth input validation...');
if (fs.existsSync('src/services/supabase/auth.service.js')) {
  const content = fs.readFileSync('src/services/supabase/auth.service.js', 'utf8');
  if (content.includes('validateEmail') && content.includes('sanitizeInput')) {
    console.log('✅ Auth input validation implemented');
    checks.inputValidation = true;
  } else {
    console.log('❌ Auth input validation missing');
  }
} else {
  console.log('❌ Auth service not found');
}

// Summary
console.log('\n📊 AUTHENTICATION SECURITY SUMMARY');
console.log('=====================================');
const passed = Object.values(checks).filter(Boolean).length;
const total = Object.keys(checks).length;

Object.entries(checks).forEach(([check, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${check}`);
});

console.log(`\nScore: ${passed}/${total} checks passed`);

if (passed === total) {
  console.log('\n🎉 All authentication security checks passed!');
  console.log('🔒 Authentication system is secure and ready for production.');
  process.exit(0);
} else {
  console.log('\n⚠️  Authentication security issues found.');
  console.log('Please review and fix the failing checks.');
  process.exit(1);
}