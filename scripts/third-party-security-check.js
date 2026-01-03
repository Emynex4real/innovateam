// Third-Party Integration Security Validation Script
const fs = require('fs');
const path = require('path');

function checkThirdPartySecurityImplementation() {
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  const checks = [
    {
      name: 'Third-Party Security Manager exists',
      check: () => fs.existsSync(path.join(__dirname, '../src/utils/thirdPartySecurityManager.js')),
      fix: 'Create src/utils/thirdPartySecurityManager.js with third-party security utilities'
    },
    {
      name: 'API response validation implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/thirdPartySecurityManager.js'), 'utf8');
        return content.includes('validateAPIResponse') && content.includes('expectedFields');
      },
      fix: 'Implement API response structure validation'
    },
    {
      name: 'Domain whitelist validation',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/thirdPartySecurityManager.js'), 'utf8');
        return content.includes('isDomainTrusted') && content.includes('trustedDomains');
      },
      fix: 'Implement domain whitelist validation'
    },
    {
      name: 'Paystack-specific validation',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/thirdPartySecurityManager.js'), 'utf8');
        return content.includes('validatePaystackResponse') && content.includes('reference');
      },
      fix: 'Implement Paystack-specific response validation'
    },
    {
      name: 'Payment service enhanced with security',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/services/payment.service.js'), 'utf8');
        return content.includes('thirdPartySecurityManager') && content.includes('validatePaystackResponse');
      },
      fix: 'Add third-party security validation to payment service'
    },
    {
      name: 'Data sanitization for third-party APIs',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/thirdPartySecurityManager.js'), 'utf8');
        return content.includes('sanitizeForThirdParty') && content.includes('sensitiveFields');
      },
      fix: 'Implement data sanitization before sending to third-party APIs'
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
const results = checkThirdPartySecurityImplementation();
console.log('\n=== Third-Party Integration Security Audit Results ===');
console.log(`Passed: ${results.passed}/${results.passed + results.failed}`);
console.log('\nDetails:');
results.details.forEach(detail => console.log(detail));

if (results.failed === 0) {
  console.log('\n🎉 All third-party security checks passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${results.failed} security issues need attention`);
  process.exit(1);
}