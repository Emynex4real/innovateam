// Email Service Test Script
import emailService from './src/services/email/emailService.js';

const testEmailService = async () => {
  console.log('🧪 Testing Email Service...');
  
  try {
    // Test 1: Welcome Email
    console.log('\n1️⃣ Testing Welcome Email...');
    const welcomeResult = await emailService.sendWelcomeEmail(
      'test@example.com', 
      'Test User'
    );
    console.log('Welcome Email Result:', welcomeResult);
    
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
    console.log('Transaction Email Result:', transactionResult);
    
    // Test 3: Credit Approval Email
    console.log('\n3️⃣ Testing Credit Approval Email...');
    const approvalResult = await emailService.sendCreditApprovalEmail(
      'test@example.com',
      'Test User',
      500,
      true
    );
    console.log('Credit Approval Email Result:', approvalResult);
    
    console.log('\n✅ All email tests completed!');
    
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
};

// Run tests
testEmailService();