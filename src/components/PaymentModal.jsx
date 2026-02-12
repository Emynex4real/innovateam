import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../App';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const PAYSTACK_PUBLIC_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;

// Load Paystack inline script once
let paystackScriptLoaded = false;
function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (paystackScriptLoaded || window.PaystackPop) {
      paystackScriptLoaded = true;
      return resolve();
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.onload = () => { paystackScriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load payment provider'));
    document.head.appendChild(script);
  });
}

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { fetchWalletData } = useWallet();
  const { user } = useAuth();

  const getAuthToken = async () => {
    const supabase = (await import('../config/supabase')).default;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token;
  };

  const handlePayment = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      toast.error('Minimum amount is ₦100');
      return;
    }
    if (numAmount > 1000000) {
      toast.error('Maximum amount is ₦1,000,000');
      return;
    }

    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Please log in again');
        setLoading(false);
        return;
      }

      // Step 1: Initialize payment on backend
      const initRes = await fetch(`${API_BASE_URL}/api/wallet/initialize-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: numAmount })
      });

      const initData = await initRes.json();
      if (!initData.success) {
        throw new Error(initData.message || 'Failed to initialize payment');
      }

      const { reference, accessCode, authorizationUrl } = initData.data;

      // Step 2: Open Paystack popup
      await loadPaystackScript();

      if (!window.PaystackPop) {
        // Fallback: redirect to authorization URL
        window.location.href = authorizationUrl;
        return;
      }

      const popup = new window.PaystackPop();
      popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: user?.email,
        amount: Math.round(numAmount * 100),
        currency: 'NGN',
        ref: reference,
        accessCode,
        onSuccess: async (transaction) => {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch(
              `${API_BASE_URL}/api/wallet/verify-payment/${transaction.reference || reference}`,
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              toast.success(`₦${numAmount.toLocaleString()} added to wallet!`);
              await fetchWalletData();
              onSuccess?.();
              onClose();
              setAmount('');
            } else {
              toast.error(verifyData.message || 'Verification failed');
            }
          } catch {
            toast.error('Payment received but verification failed. Your balance will update shortly.');
          }
          setLoading(false);
        },
        onCancel: () => {
          toast.error('Payment cancelled');
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
        }
      });
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
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
              placeholder="Enter amount (min ₦100)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max="1000000"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : `Pay ₦${amount ? parseFloat(amount).toLocaleString() : '0'}`}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
          {!PAYSTACK_PUBLIC_KEY && (
            <p className="text-xs text-red-500">Payment provider not configured. Contact support.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;
