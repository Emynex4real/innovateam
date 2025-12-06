// Test Email System
const emailService = require('./src/services/email/emailService.js');

const testEmailSystem = async () => {
  console.log('🧪 Testing Email System...\n');
  
  try {
    // Test 1: Welcome Email
    console.log('1️⃣ Testing Welcome Email...');
    const welcomeResult = await emailService.sendWelcomeEmail(
      'test@example.com', 
      'Test User'
    );
    console.log('Welcome Email Result:', welcomeResult.success ? '✅ Success' : '❌ Failed');
    if (!welcomeResult.success) console.log('Error:', welcomeResult.error);
    
    // Test 2: Transaction Email
    console.log('\n2️⃣ Testing Transaction Email...');
    const transactionResult = await emailService.sendTransactionEmail(
      'test@example.com',
      'Test User',
      {
        type: 'credit',
        amount: 1000,
        status: 'successful',
        description: 'Test credit transaction'
      }
    );
    console.log('Transaction Email Result:', transactionResult.success ? '✅ Success' : '❌ Failed');
    if (!transactionResult.success) console.log('Error:', transactionResult.error);
    
    // Test 3: Credit Approval Email
    console.log('\n3️⃣ Testing Credit Approval Email...');
    const approvalResult = await emailService.sendCreditApprovalEmail(
      'test@example.com',
      'Test User',
      500,
      true
    );
    console.log('Credit Approval Email Result:', approvalResult.success ? '✅ Success' : '❌ Failed');
    if (!approvalResult.success) console.log('Error:', approvalResult.error);
    
    console.log('\n📋 Email System Test Summary:');
    console.log(`- Welcome Email: ${welcomeResult.success ? '✅' : '❌'}`);
    console.log(`- Transaction Email: ${transactionResult.success ? '✅' : '❌'}`);
    console.log(`- Credit Approval Email: ${approvalResult.success ? '✅' : '❌'}`);
    
    const allPassed = welcomeResult.success && transactionResult.success && approvalResult.success;
    console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️ Some tests failed - check backend server'}`);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Backend server is running (npm start in server folder)');
    console.log('2. RESEND_API_KEY is set in server/.env');
    console.log('3. Frontend REACT_APP_API_URL points to backend');
  }
};

// Run tests
testEmailSystem();