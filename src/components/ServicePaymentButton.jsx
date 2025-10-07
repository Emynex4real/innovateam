import React, { useState } from 'react';
import { Button } from './ui/button';
import { Wallet, CreditCard } from 'lucide-react';
import { useServicePayment } from '../hooks/useServicePayment';
import PaymentConfirmation from './PaymentConfirmation';
import { SERVICE_PRICES } from '../services/wallet.service.enhanced';

const ServicePaymentButton = ({ 
  serviceKey, 
  serviceName, 
  customAmount = null, 
  onPaymentSuccess, 
  onPaymentError,
  className = "",
  variant = "default",
  size = "default"
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { processPayment, checkBalance, getRequiredAmount, loading, walletBalance } = useServicePayment();

  const amount = getRequiredAmount(serviceKey, customAmount);
  const hasBalance = checkBalance(serviceKey, customAmount);

  const handlePayment = async () => {
    const result = await processPayment(serviceKey, customAmount);
    
    if (result.success) {
      setShowConfirmation(false);
      onPaymentSuccess?.(result);
    } else {
      onPaymentError?.(result.error);
    }
  };

  const handleClick = () => {
    if (!hasBalance) {
      onPaymentError?.(`Insufficient balance. Required: ₦${amount.toLocaleString()}, Available: ₦${walletBalance.toLocaleString()}`);
      return;
    }
    setShowConfirmation(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={loading}
        variant={variant}
        size={size}
        className={className}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {loading ? 'Processing...' : `Pay ₦${amount.toLocaleString()}`}
      </Button>

      <PaymentConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handlePayment}
        service={{ name: serviceName, key: serviceKey }}
        amount={amount}
        walletBalance={walletBalance}
        loading={loading}
      />
    </>
  );
};

export default ServicePaymentButton;