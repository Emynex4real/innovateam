// Security Monitoring & Incident Response Validation Script
const fs = require('fs');
const path = require('path');

function checkSecurityMonitoringImplementation() {
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };

  const checks = [
    {
      name: 'Security Monitor exists',
      check: () => fs.existsSync(path.join(__dirname, '../src/utils/securityMonitor.js')),
      fix: 'Create src/utils/securityMonitor.js with security monitoring utilities'
    },
    {
      name: 'Real-time monitoring implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/securityMonitor.js'), 'utf8');
        return content.includes('setupRealTimeMonitoring') && content.includes('MutationObserver');
      },
      fix: 'Implement real-time DOM and network monitoring'
    },
    {
      name: 'Incident management implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/securityMonitor.js'), 'utf8');
        return content.includes('createSecurityIncident') && content.includes('activeIncidents');
      },
      fix: 'Implement security incident creation and management'
    },
    {
      name: 'Automated response implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/securityMonitor.js'), 'utf8');
        return content.includes('autoRespond') && content.includes('temporaryAccountLock');
      },
      fix: 'Implement automated incident response mechanisms'
    },
    {
      name: 'Security monitoring database schema exists',
      check: () => fs.existsSync(path.join(__dirname, '../supabase/security_monitoring_tables.sql')),
      fix: 'Create supabase/security_monitoring_tables.sql with monitoring database schema'
    },
    {
      name: 'Security reporting implemented',
      check: () => {
        const content = fs.readFileSync(path.join(__dirname, '../src/utils/securityMonitor.js'), 'utf8');
        return content.includes('generateSecurityReport') && content.includes('security_incidents');
      },
      fix: 'Implement security metrics and reporting functionality'
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
const results = checkSecurityMonitoringImplementation();
console.log('\n=== Security Monitoring & Incident Response Audit Results ===');
console.log(`Passed: ${results.passed}/${results.passed + results.failed}`);
console.log('\nDetails:');
results.details.forEach(detail => console.log(detail));

if (results.failed === 0) {
  console.log('\n🎉 All security monitoring checks passed!');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${results.failed} security issues need attention`);
  process.exit(1);
}