import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Wallet, CreditCard, AlertCircle, CheckCircle, X } from 'lucide-react';

const PaymentConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  service, 
  amount, 
  walletBalance, 
  loading = false 
}) => {
  if (!isOpen) return null;

  const hasInsufficientFunds = walletBalance < amount;
  const remainingBalance = walletBalance - amount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-background rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Confirm Payment</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">{service.name}</h3>
            <p className="text-2xl font-bold text-primary">₦{amount.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Current Balance</span>
              </div>
              <span className="font-medium">₦{walletBalance.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Service Cost</span>
              <span className="font-medium text-red-600">-₦{amount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
              <span className="text-sm font-medium">Balance After Payment</span>
              <span className={`font-bold ${hasInsufficientFunds ? 'text-red-600' : 'text-green-600'}`}>
                ₦{hasInsufficientFunds ? '0' : remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {hasInsufficientFunds && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Insufficient Balance</p>
                  <p>You need ₦{(amount - walletBalance).toLocaleString()} more to complete this payment.</p>
                </div>
              </div>
            </div>
          )}

          {!hasInsufficientFunds && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium">Payment Ready</p>
                  <p>Your payment will be processed instantly from your wallet balance.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={hasInsufficientFunds || loading}
            className={hasInsufficientFunds ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {loading ? 'Processing...' : hasInsufficientFunds ? 'Insufficient Funds' : 'Confirm Payment'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaymentConfirmation;