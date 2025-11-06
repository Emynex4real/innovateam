const TransactionService = require('./services/transaction.service');

async function testTransactions() {
  try {
    console.log('Testing transaction recording...');
    
    // Test service purchase
    const transaction = await TransactionService.recordServicePurchase('test-user-id', {
      serviceName: 'JAMB Form Purchase',
      amount: 500.00,
      category: 'jamb_services',
      serviceType: 'form_purchase',
      description: 'Test JAMB form purchase'
    });
    
    console.log('✅ Transaction recorded:', transaction);
    
    // Test wallet funding
    const fundingTx = await TransactionService.recordWalletFunding('test-user-id', 1000.00, 'TEST-REF-123');
    
    console.log('✅ Wallet funding recorded:', fundingTx);
    
    // Get transaction history
    const history = await TransactionService.getUserTransactionHistory('test-user-id');
    
    console.log('✅ Transaction history:', history);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTransactions();