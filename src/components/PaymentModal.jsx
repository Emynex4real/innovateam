import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useWallet } from '../contexts/WalletContext';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { fundWallet } = useWallet();

  const handlePayment = async () => {
    if (!amount || amount < 100) {
      toast.error('Minimum amount is ₦100');
      return;
    }

    setLoading(true);
    try {
      // For now, simulate payment success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await fundWallet(parseFloat(amount), 'card', `PAY_${Date.now()}`);
      if (result.success) {
        toast.success(`₦${amount} added to wallet successfully!`);
        onSuccess?.();
        onClose();
        setAmount('');
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Fund Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : `Pay ₦${amount || '0'}`}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;