// Client-Side Security Validation Script
const fs = require('fs');
const path = require('path');

function checkClientSecurityImplementation() {
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  const checks = [
    {
      name: 'Client Security Manager exists',
      check: () => fs.existsSync(path.join(__dirname, '../src/utils/clientSecurity.js')),
      fix: 'Create src/utils/clientSecurity.js with client security utilities'
    },
    {
      name: 'XSS protection implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/clientSecurity.js'), 'utf8');
        return content.includes('sanitizeHTML') && content.includes('textContent');
      },
      fix: 'Implement DOM-based XSS protection'
    },
    {
      name: 'Secure storage with encryption',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/clientSecurity.js'), 'utf8');
        return content.includes('setSecureItem') && content.includes('AES.encrypt');
      },
      fix: 'Implement encrypted session storage'
    },
    {
      name: 'CSP violation monitoring',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/clientSecurity.js'), 'utf8');
        return content.includes('securitypolicyviolation') && content.includes('cspViolations');
      },
      fix: 'Add CSP violation event listener'
    },
    {
      name: 'Security headers in HTML',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
        return content.includes('Content-Security-Policy') && content.includes('X-Frame-Options');
      },
      fix: 'Add comprehensive security headers to index.html'
    },
    {
      name: 'Input validation patterns',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/clientSecurity.js'), 'utf8');
        return content.includes('validateInput') && content.includes('patterns');
      },
      fix: 'Implement client-side input validation patterns'
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
const results = checkClientSecurityImplementation();
console.log('\n=== Client-Side Security Audit Results ===');
console.log(`Passed: ${results.passed}/${results.passed + results.failed}`);
console.log('\nDetails:');
results.details.forEach(detail => console.log(detail));

if (results.failed === 0) {
  console.log('\n🎉 All client security checks passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${results.failed} security issues need attention`);
  process.exit(1);
}