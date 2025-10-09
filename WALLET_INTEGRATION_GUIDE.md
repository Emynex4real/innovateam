# Wallet & Payment Integration Guide

## Overview

This guide explains how to implement wallet funding and transaction handling in your JAMB Course Advisor application.

## Features Implemented

### 1. Wallet Funding
- **Paystack Integration**: Secure card payments via Paystack
- **Test Mode**: Demo funding for development/testing
- **Real-time Balance Updates**: Instant balance reflection after payments
- **Transaction History**: Complete audit trail of all transactions

### 2. Service Payments
- **Wallet Deduction**: Pay for services using wallet balance
- **Balance Validation**: Automatic insufficient funds checking
- **Service Pricing**: Predefined pricing for all services
- **Payment Confirmation**: User-friendly confirmation dialogs

### 3. Transaction Management
- **Complete History**: All transactions with detailed metadata
- **Search & Filter**: Find transactions by type, amount, or description
- **Export Functionality**: Download transaction history as CSV
- **Real-time Updates**: Live transaction status updates

## Implementation Guide

### 1. Basic Service Payment

```jsx
import ServicePaymentButton from '../components/ServicePaymentButton';

// In your service component
<ServicePaymentButton
  serviceKey="waec-result-checker"
  serviceName="WAEC Result Checker"
  onPaymentSuccess={(result) => {
    console.log('Payment successful:', result);
    // Proceed with service
  }}
  onPaymentError={(error) => {
    console.error('Payment failed:', error);
    // Handle error
  }}
/>
```

### 2. Custom Amount Payment

```jsx
<ServicePaymentButton
  serviceKey="airtime-topup"
  serviceName="Airtime Top-up"
  customAmount={1000} // Custom amount
  onPaymentSuccess={handleAirtimeSuccess}
  onPaymentError={handlePaymentError}
/>
```

### 3. Using Payment Hook Directly

```jsx
import { useServicePayment } from '../hooks/useServicePayment';

const MyComponent = () => {
  const { processPayment, checkBalance, walletBalance } = useServicePayment();

  const handlePayment = async () => {
    if (!checkBalance('waec-result-checker')) {
      alert('Insufficient balance');
      return;
    }

    const result = await processPayment('waec-result-checker');
    if (result.success) {
      // Payment successful
      console.log('New balance:', result.newBalance);
    }
  };

  return (
    <div>
      <p>Balance: ₦{walletBalance.toLocaleString()}</p>
      <button onClick={handlePayment}>Pay for WAEC</button>
    </div>
  );
};
```

### 4. Wallet Context Usage

```jsx
import { useWallet } from '../contexts/WalletContext';

const WalletComponent = () => {
  const { 
    walletBalance, 
    transactions, 
    fundWallet, 
    getTransactionStats 
  } = useWallet();

  const handleFunding = async () => {
    try {
      const result = await fundWallet(5000, 'card', 'user@example.com');
      console.log('Funding successful:', result);
    } catch (error) {
      console.error('Funding failed:', error);
    }
  };

  return (
    <div>
      <h2>Balance: ₦{walletBalance.toLocaleString()}</h2>
      <button onClick={handleFunding}>Fund Wallet</button>
    </div>
  );
};
```

## Service Pricing

Current service prices are defined in `SERVICE_PRICES`:

```javascript
export const SERVICE_PRICES = {
  'waec-result-checker': 3400,
  'neco-result-checker': 3400,
  'nabteb-result-checker': 3400,
  'nbais-result-checker': 3400,
  'waec-gce': 3400,
  'olevel-upload': 1000,
  'original-result': 2000,
  'pin-vending': 4700,
  'reprinting': 1500,
  'admission-letter': 2500,
  'ai-examiner': 750,
  'course-advisor': 500,
  'airtime-topup': 0, // Variable
  'data-subscription': 0 // Variable
};
```

## Environment Setup

### 1. Add Environment Variables

Create/update `.env` file:

```env
# Paystack Configuration
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here

# Existing variables...
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 2. Get Paystack Keys

1. Sign up at [paystack.com](https://paystack.com)
2. Get your test public key from the dashboard
3. Add it to your environment variables

## Payment Flow

### 1. Card Payment Flow

```
User clicks "Fund Wallet" 
→ Enters amount 
→ Selects "Card Payment" 
→ Paystack popup opens 
→ User enters card details 
→ Payment processed 
→ Wallet balance updated 
→ Transaction recorded
```

### 2. Service Payment Flow

```
User clicks service payment button 
→ System checks wallet balance 
→ Shows confirmation dialog 
→ User confirms payment 
→ Amount deducted from wallet 
→ Service activated 
→ Transaction recorded
```

## Error Handling

### Common Errors and Solutions

1. **Insufficient Balance**
   ```javascript
   // Check balance before payment
   if (!checkBalance(serviceKey)) {
     toast.error('Please fund your wallet first');
     return;
   }
   ```

2. **Payment Cancelled**
   ```javascript
   try {
     await fundWallet(amount, 'card', email);
   } catch (error) {
     if (error.message.includes('cancelled')) {
       toast.error('Payment was cancelled');
     }
   }
   ```

3. **Network Issues**
   ```javascript
   // Implement retry logic
   const retryPayment = async (retries = 3) => {
     for (let i = 0; i < retries; i++) {
       try {
         return await processPayment(serviceKey);
       } catch (error) {
         if (i === retries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000));
       }
     }
   };
   ```

## Testing

### 1. Test Mode Funding

Use the "Test Funding" option in the wallet to add funds without actual payment:

```javascript
await fundWallet(5000, 'test'); // Instantly adds ₦5000
```

### 2. Paystack Test Cards

Use these test card numbers in Paystack test mode:

- **Successful**: 4084084084084081
- **Insufficient Funds**: 4084084084084081 (amount > 300000)
- **Invalid Card**: 4084084084084082

## Security Considerations

1. **Never expose secret keys** in frontend code
2. **Validate amounts** on both frontend and backend
3. **Implement rate limiting** for payment attempts
4. **Log all transactions** for audit purposes
5. **Use HTTPS** in production

## Production Deployment

### 1. Update Environment Variables

```env
# Production Paystack key
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
REACT_APP_ENVIRONMENT=production
```

### 2. Backend Integration

When integrating with a real backend:

1. Replace localStorage with API calls
2. Implement proper authentication
3. Add server-side payment verification
4. Set up webhooks for payment notifications

### 3. Monitoring

- Monitor transaction success rates
- Set up alerts for failed payments
- Track wallet funding patterns
- Monitor for suspicious activities

## Support

For issues or questions:

1. Check the browser console for errors
2. Verify environment variables are set
3. Test with Paystack test cards first
4. Check network connectivity
5. Ensure sufficient wallet balance for services

## Future Enhancements

1. **Multiple Payment Methods**: Bank transfer, USSD, etc.
2. **Subscription Plans**: Monthly/yearly service subscriptions
3. **Referral System**: Earn wallet credits for referrals
4. **Bulk Payments**: Pay for multiple services at once
5. **Payment Analytics**: Detailed spending insights