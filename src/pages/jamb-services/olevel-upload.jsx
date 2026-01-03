import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const OLevelUpload = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>O-Level Upload Service</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Upload your O-Level results to JAMB portal
          </p>
          <Button>Start Upload Process</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OLevelUpload;