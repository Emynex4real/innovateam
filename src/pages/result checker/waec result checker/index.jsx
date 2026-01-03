import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { useWallet } from '../../../contexts/WalletContext';
import { resultCheckerService } from '../../../services/resultChecker.service';
import toast from 'react-hot-toast';

const WaecResultChecker = () => {
  const [examNumber, setExamNumber] = useState('');
  const [examYear, setExamYear] = useState('2024');
  const [serial, setSerial] = useState('');
  const [pin, setPin] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const { walletBalance, addTransaction } = useWallet();

  const CARD_PRICE = 3500;

  const handlePurchaseCard = async () => {
    if (walletBalance < CARD_PRICE) {
      toast.error('Insufficient balance. Please fund your wallet.');
      return;
    }

    setPurchaseLoading(true);
    try {
      const purchaseResult = await resultCheckerService.purchaseResultChecker('waec', { amount: CARD_PRICE });
      
      if (purchaseResult.success) {
        await addTransaction({
          label: 'WAEC Result Checker Card',
          description: 'Purchased WAEC scratch card',
          amount: CARD_PRICE,
          type: 'debit',
          category: 'education',
          status: 'Successful'
        });
        
        const card = purchaseResult.cards[0];
        setSerial(card.serial);
        setPin(card.pin);
        toast.success('WAEC card purchased successfully!');
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleCheckResult = async () => {
    if (!examNumber || !examYear || !serial || !pin) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const checkResult = await resultCheckerService.checkResult(
        'waec', { examNumber, examYear, serial, pin }
      );
      
      if (checkResult.success) {
        setResult(checkResult.result);
        toast.success('Result retrieved successfully!');
      } else {
        toast.error(checkResult.error || 'Failed to check result');
      }
    } catch (error) {
      toast.error('Failed to check result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">WAEC Result Checker</h1>
        <p className="text-muted-foreground mt-2">
          Purchase scratch cards and check your WAEC results instantly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Card */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Scratch Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">₦{CARD_PRICE.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Per Card</p>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>Your Balance: <span className="font-semibold text-primary">₦{walletBalance.toLocaleString()}</span></p>
            </div>
            
            <Button 
              onClick={handlePurchaseCard}
              disabled={purchaseLoading || walletBalance < CARD_PRICE}
              className="w-full"
            >
              {purchaseLoading ? 'Purchasing...' : 'Purchase Card'}
            </Button>
          </CardContent>
        </Card>

        {/* Check Result */}
        <Card>
          <CardHeader>
            <CardTitle>Check Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="examNumber">Exam Number</Label>
                <Input
                  id="examNumber"
                  value={examNumber}
                  onChange={(e) => setExamNumber(e.target.value)}
                  placeholder="Enter exam number"
                />
              </div>
              <div>
                <Label htmlFor="examYear">Exam Year</Label>
                <Input
                  id="examYear"
                  value={examYear}
                  onChange={(e) => setExamYear(e.target.value)}
                  placeholder="2024"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="serial">Serial Number</Label>
              <Input
                id="serial"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="WAE-XXXX-XXXX-XXXX"
              />
            </div>
            
            <div>
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
              />
            </div>
            
            <Button 
              onClick={handleCheckResult}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Checking...' : 'Check Result'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Result Display */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Examination Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Candidate Name</p>
                  <p className="font-semibold">{result.candidateName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exam Number</p>
                  <p className="font-semibold">{result.examNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exam Year</p>
                  <p className="font-semibold">{result.examYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Center</p>
                  <p className="font-semibold">{result.center}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Subject Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {result.subjects.map((subject, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm">{subject.subject}</span>
                      <Badge variant={subject.grade.startsWith('A') ? 'default' : subject.grade.startsWith('B') ? 'secondary' : 'outline'}>
                        {subject.grade}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WaecResultChecker;

