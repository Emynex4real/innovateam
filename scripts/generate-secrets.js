const crypto = require('crypto');

console.log('=== Credential Generator ===\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Generate Session Secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET:');
console.log(sessionSecret);
console.log('');

console.log('=== Next Steps ===');
console.log('1. Update server/.env with these values');
console.log('2. Update Render environment variables');
console.log('3. Restart your backend server');
console.log('4. Rotate Supabase keys: Dashboard → Settings → API');
console.log('5. Rotate Sentry DSN: Settings → Projects → [Your Project]');
console.log('6. Rotate Paystack keys: Settings → API Keys & Webhooks');
