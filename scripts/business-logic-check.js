// Business Logic Security Validation Script
const fs = require('fs');
const path = require('path');

function checkBusinessLogicSecurity() {
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  const checks = [
    {
      name: 'Business Logic Security exists',
      check: () => fs.existsSync(path.join(__dirname, '../src/utils/businessLogicSecurity.js')),
      fix: 'Create src/utils/businessLogicSecurity.js with business logic security'
    },
    {
      name: 'Transaction validation implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/businessLogicSecurity.js'), 'utf8');
        return content.includes('validateTransaction') && content.includes('transactionLimits');
      },
      fix: 'Implement transaction amount and limit validation'
    },
    {
      name: 'Course recommendation validation',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/businessLogicSecurity.js'), 'utf8');
        return content.includes('validateCourseRecommendation') && content.includes('validGrades');
      },
      fix: 'Implement course recommendation input validation'
    },
    {
      name: 'File upload validation',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/businessLogicSecurity.js'), 'utf8');
        return content.includes('validateQuestionGeneration') && content.includes('maxSize');
      },
      fix: 'Implement file upload security validation'
    },
    {
      name: 'Wallet operation rules',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/businessLogicSecurity.js'), 'utf8');
        return content.includes('enforceWalletRules') && content.includes('withdraw');
      },
      fix: 'Implement wallet operation business rules'
    },
    {
      name: 'Permission validation',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/businessLogicSecurity.js'), 'utf8');
        return content.includes('validateUserPermissions') && content.includes('rolePermissions');
      },
      fix: 'Implement role-based permission validation'
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
const results = checkBusinessLogicSecurity();
console.log('\n=== Business Logic Security Audit Results ===');
console.log(`Passed: ${results.passed}/${results.passed + results.failed}`);
console.log('\nDetails:');
results.details.forEach(detail => console.log(detail));

if (results.failed === 0) {
  console.log('\n🎉 All business logic security checks passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${results.failed} security issues need attention`);
  process.exit(1);
}