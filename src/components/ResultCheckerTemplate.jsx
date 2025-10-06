import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, CreditCard, FileText, Calendar, Hash } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';

const ResultCheckerTemplate = ({ 
  title, 
  description, 
  pricePerCard, 
  serialPrefix, 
  initialCards = [] 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [purchasedCards, setPurchasedCards] = useState(initialCards);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
  const [copiedCardId, setCopiedCardId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Mock data for now - will be replaced with Supabase data
  const walletBalance = 0;
  const addTransaction = (transaction) => {};

  const totalAmount = quantity * pricePerCard;

  const handleQuantityChange = (e) => {
    setQuantity(parseInt(e.target.value, 10));
  };

  const generateCard = () => {
    const serial = `${serialPrefix}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pin = Math.floor(100000000 + Math.random() * 900000000).toString();
    return { id: Date.now() + Math.random(), serial, pin, date: new Date().toLocaleDateString('en-CA') };
  };

  const handlePurchaseClick = () => {
    setShowConfirmModal(true);
  };

  const confirmPurchase = async () => {
    setShowConfirmModal(false);
    setIsPurchasing(true);
    setNotification({ visible: false, message: '', type: '' });

    try {
      if (totalAmount > walletBalance) {
        throw new Error('Insufficient wallet balance');
      }

      addTransaction({
        amount: totalAmount,
        type: 'debit',
        label: title,
        description: `Purchase of ${quantity} ${title} Card${quantity > 1 ? 's' : ''}`,
        category: 'scratch_card',
        status: 'Successful'
      });

      const newCards = Array.from({ length: quantity }, () => generateCard());
      setPurchasedCards((prev) => [...newCards, ...prev]);
      
      setNotification({ 
        visible: true, 
        message: `${quantity} ${title.split(' ')[0]} card(s) purchased successfully!`, 
        type: 'success' 
      });
      setQuantity(1);
    } catch (error) {
      setNotification({ 
        visible: true, 
        message: error.message === 'Insufficient wallet balance' 
          ? 'Insufficient wallet balance. Please fund your wallet.'
          : 'Purchase failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsPurchasing(false);
      setTimeout(() => setNotification({ visible: false, message: '', type: '' }), 2500);
    }
  };

  const copyCardDetails = (card) => {
    const details = `Serial: ${card.serial}\nPIN: ${card.pin}`;
    navigator.clipboard.writeText(details);
    setCopiedCardId(card.id);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  const clearPurchasedCards = () => {
    setPurchasedCards([]);
    setNotification({ visible: true, message: 'Purchased cards cleared!', type: 'success' });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Notification */}
        {notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg text-white font-medium flex items-center gap-3 z-50 ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchase Section */}
          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Purchase {title.split(' ')[0]} Cards</span>
                </CardTitle>
                <CardDescription>
                  Select quantity and purchase your {title.toLowerCase()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Select Quantity</Label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    disabled={isPurchasing}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <Input
                    value={`₦${totalAmount.toLocaleString()}`}
                    readOnly
                    className="font-semibold text-primary"
                  />
                </div>
                
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span>Price per card:</span>
                    <span className="font-semibold">₦{pricePerCard.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span>Wallet Balance:</span>
                    <span className={`font-semibold ${walletBalance >= totalAmount ? 'text-green-600' : 'text-red-600'}`}>
                      ₦{walletBalance.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <Button
                  onClick={handlePurchaseClick}
                  disabled={isPurchasing || walletBalance < totalAmount}
                  className="w-full"
                  size="lg"
                >
                  {isPurchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Purchased Cards Section */}
          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Your Cards</span>
                    </CardTitle>
                    <CardDescription>
                      {purchasedCards.length} card{purchasedCards.length !== 1 ? 's' : ''} purchased
                    </CardDescription>
                  </div>
                  {purchasedCards.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearPurchasedCards}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[450px] overflow-y-auto">
                  {purchasedCards.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No cards purchased yet</p>
                      <p className="text-sm text-muted-foreground">Purchase your first {title.split(' ')[0]} card to get started</p>
                    </div>
                  ) : (
                    purchasedCards.map((card) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 rounded-lg border hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Serial: {card.serial}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">PIN: {card.pin}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{card.date}</span>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyCardDetails(card)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedCardId === card.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirm Purchase</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to purchase {quantity} {title} card{quantity > 1 ? 's' : ''} for ₦{totalAmount.toLocaleString()}?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={confirmPurchase}
                >
                  Confirm Purchase
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCheckerTemplate;