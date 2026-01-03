// Compliance & Privacy Security Validation Script
const fs = require('fs');
const path = require('path');

function checkComplianceImplementation() {
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  const checks = [
    {
      name: 'Compliance Manager exists',
      check: () => fs.existsSync(path.join(__dirname, '../src/utils/complianceManager.js')),
      fix: 'Create src/utils/complianceManager.js with compliance utilities'
    },
    {
      name: 'Data subject rights implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/complianceManager.js'), 'utf8');
        return content.includes('handleDataSubjectRequest') && content.includes('access');
      },
      fix: 'Implement GDPR data subject rights (access, erasure, portability)'
    },
    {
      name: 'Consent management implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/complianceManager.js'), 'utf8');
        return content.includes('recordConsent') && content.includes('consentTypes');
      },
      fix: 'Implement consent recording and management'
    },
    {
      name: 'Data retention policies implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/complianceManager.js'), 'utf8');
        return content.includes('enforceDataRetention') && content.includes('dataRetentionPeriods');
      },
      fix: 'Implement automated data retention policy enforcement'
    },
    {
      name: 'Compliance database schema exists',
      check: () => fs.existsSync(path.join(__dirname, '../supabase/compliance_tables.sql')),
      fix: 'Create supabase/compliance_tables.sql with compliance database schema'
    },
    {
      name: 'Privacy compliance validation',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/complianceManager.js'), 'utf8');
        return content.includes('validatePrivacyCompliance') && content.includes('requiredConsents');
      },
      fix: 'Implement privacy compliance validation checks'
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
const results = checkComplianceImplementation();
console.log('\n=== Compliance & Privacy Security Audit Results ===');
console.log(`Passed: ${results.passed}/${results.passed + results.failed}`);
console.log('\nDetails:');
results.details.forEach(detail => console.log(detail));

if (results.failed === 0) {
  console.log('\n🎉 All compliance & privacy checks passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${results.failed} security issues need attention`);
  process.exit(1);
}