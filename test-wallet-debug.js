// Test wallet localStorage functions
const WALLET_STORAGE_KEY = 'mock_wallet_data';

function getWalletData() {
  const stored = localStorage.getItem(WALLET_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Default wallet data
  const defaultData = {
    balance: 0,
    transactions: []
  };
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(defaultData));
  return defaultData;
}

function saveWalletData(data) {
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(data));
}

// Test funding wallet
function testFundWallet(amount) {
  const walletData = getWalletData();
  const fundAmount = parseFloat(amount);
  
  // Add to balance
  walletData.balance += fundAmount;
  
  // Add transaction record
  const transaction = {
    id: `txn-${Date.now()}`,
    type: 'credit',
    amount: fundAmount,
    currency: 'USD',
    date: new Date().toISOString(),
    description: `Wallet funding via card`,
    paymentMethod: 'card',
    status: 'completed'
  };
  
  walletData.transactions.unshift(transaction);
  saveWalletData(walletData);
  
  console.log('Wallet funded:', walletData);
  return walletData;
}

// Test the functions
console.log('Initial wallet data:', getWalletData());
console.log('After funding 1000:', testFundWallet(1000));
console.log('Current wallet data:', getWalletData());