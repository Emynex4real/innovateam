import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

const DebugPanel = () => {
  const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
  const walletBalance = localStorage.getItem('wallet_balance') || '0';

  const debugInfo = {
    user: currentUser,
    hasValidUUID: currentUser.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id),
    walletBalance: walletBalance,
    localStorage: {
      confirmedUser: !!localStorage.getItem('confirmedUser'),
      walletBalance: !!localStorage.getItem('wallet_balance'),
      allKeys: Object.keys(localStorage)
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h3 className="font-bold mb-2">Debug Information</h3>
        <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
        <div className="flex gap-2 mt-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => console.log('Debug Info:', debugInfo)}
          >
            Log to Console
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              localStorage.removeItem('confirmedUser');
              localStorage.removeItem('wallet_balance');
              window.location.reload();
            }}
          >
            Clear & Reload
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;