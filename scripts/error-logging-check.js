// Error Handling & Logging Security Validation Script
const fs = require('fs');
const path = require('path');

function checkErrorLoggingImplementation() {
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  const checks = [
    {
      name: 'Secure Logger exists',
      check: () => fs.existsSync(path.join(__dirname, '../src/utils/secureLogger.js')),
      fix: 'Create src/utils/secureLogger.js with secure logging utilities'
    },
    {
      name: 'Sensitive data sanitization',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/secureLogger.js'), 'utf8');
        return content.includes('sanitizeLogData') && content.includes('sensitivePatterns');
      },
      fix: 'Implement sensitive data sanitization in logs'
    },
    {
      name: 'Security event logging',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/secureLogger.js'), 'utf8');
        return content.includes('logSecurityEvent') && content.includes('security');
      },
      fix: 'Implement security event logging'
    },
    {
      name: 'Error Handler exists',
      check: () => fs.existsSync(path.join(__dirname, '../src/utils/errorHandler.js')),
      fix: 'Create src/utils/errorHandler.js with error handling utilities'
    },
    {
      name: 'User-friendly error messages',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/errorHandler.js'), 'utf8');
        return content.includes('getUserFriendlyMessage') && content.includes('errorMappings');
      },
      fix: 'Implement user-friendly error message mapping'
    },
    {
      name: 'Global error handling setup',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/secureLogger.js'), 'utf8');
        return content.includes('setupGlobalErrorHandling') && content.includes('unhandledrejection');
      },
      fix: 'Setup global error handlers for unhandled errors'
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
const results = checkErrorLoggingImplementation();
console.log('\n=== Error Handling & Logging Security Audit Results ===');
console.log(`Passed: ${results.passed}/${results.passed + results.failed}`);
console.log('\nDetails:');
results.details.forEach(detail => console.log(detail));

if (results.failed === 0) {
  console.log('\n🎉 All error handling & logging checks passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${results.failed} security issues need attention`);
  process.exit(1);
}