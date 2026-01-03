import supabaseWalletService from '../services/supabaseWallet.service';

export const testAddTransaction = async () => {
  console.log('🧪 Testing transaction creation...');
  
  // Use the real Supabase user ID from your auth users
  const userId = '15ee5056-eac2-49dd-bd42-1895546543c2'; // emynex4real@gmail.com
  const userEmail = 'emynex4real@gmail.com';
  
  console.log('User ID:', userId);
  console.log('User Email:', userEmail);
  
  try {
    const result = await supabaseWalletService.addTransaction(
      userId,
      userEmail,
      {
        description: 'Test Transaction',
        amount: 100,
        type: 'credit',
        status: 'successful'
      }
    );
    
    if (result.success) {
      console.log('✅ Transaction created successfully!');
      console.log('Transaction:', result.transaction);
    } else {
      console.error('❌ Transaction failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};

export const testWalletFunding = async () => {
  console.log('🧪 Testing wallet funding...');
  
  // Use the real Supabase user ID
  const userId = '15ee5056-eac2-49dd-bd42-1895546543c2';
  const userEmail = 'emynex4real@gmail.com';
  
  try {
    const result = await supabaseWalletService.fundWallet(
      userId,
      userEmail,
      500,
      'test'
    );
    
    if (result.success) {
      console.log('✅ Wallet funded successfully!');
      console.log('New Balance:', result.newBalance);
      console.log('Transaction:', result.transaction);
    } else {
      console.error('❌ Funding failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};