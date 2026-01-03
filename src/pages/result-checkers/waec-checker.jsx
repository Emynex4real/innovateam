import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const WaecChecker = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>WAEC Result Checker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Check your WAEC examination results
          </p>
          <Button>Check Results</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaecChecker;