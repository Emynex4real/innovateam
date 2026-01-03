// API Security Validation Script
const fs = require('fs');
const path = require('path');

function checkAPISecurityImplementation() {
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  const checks = [
    {
      name: 'API Security Manager exists',
      check: () => fs.existsSync(path.join(__dirname, '../src/utils/apiSecurity.js')),
      fix: 'Create src/utils/apiSecurity.js with security utilities'
    },
    {
      name: 'Request signing implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/apiSecurity.js'), 'utf8');
        return content.includes('generateSignature') && content.includes('HmacSHA256');
      },
      fix: 'Implement request signing with HMAC-SHA256'
    },
    {
      name: 'Rate limiting implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/apiSecurity.js'), 'utf8');
        return content.includes('checkRateLimit') && content.includes('rateLimits');
      },
      fix: 'Implement client-side rate limiting'
    },
    {
      name: 'Request sanitization implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/apiSecurity.js'), 'utf8');
        return content.includes('sanitizeRequest') && content.includes('script');
      },
      fix: 'Implement XSS protection in request sanitization'
    },
    {
      name: 'API client enhanced with security',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/api.js'), 'utf8');
        return content.includes('apiSecurity') && content.includes('interceptors');
      },
      fix: 'Add security interceptors to API client'
    },
    {
      name: 'Timeout protection implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/api.js'), 'utf8');
        return content.includes('timeout') && content.includes('ECONNABORTED');
      },
      fix: 'Add request timeout and abort handling'
    }
  ];

  checks.forEach(check => {
    try {
      if (check.check()) {
        results.passed++;
        results.details.push(`✅ ${check.name}`);
      } else {
        results.failed++;
        results.details.push(`❌ ${check.name} - ${check.fix}`);
      }
    } catch (error) {
      results.failed++;
      results.details.push(`❌ ${check.name} - Error: ${error.message}`);
    }
  });

  return results;
}

// Run validation
const results = checkAPISecurityImplementation();
console.log('\n=== API Security Audit Results ===');
console.log(`Passed: ${results.passed}/${results.passed + results.failed}`);
console.log('\nDetails:');
results.details.forEach(detail => console.log(detail));

if (results.failed === 0) {
  console.log('\n🎉 All API security checks passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${results.failed} security issues need attention`);
  process.exit(1);
}