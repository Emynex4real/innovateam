import React from 'react';
import { FileText } from 'lucide-react';
import ResultCheckerTemplate from '../../../components/ResultCheckerTemplate';

const WaecResultChecker = () => {
  return (
    <ResultCheckerTemplate
      title="WAEC Result Checker"
      description="Purchase your WAEC scratch cards seamlessly and check your results instantly"
      pricePerCard={3500}
      serialPrefix="WAE"
      initialCards={[
        { id: 1, serial: 'WAE-1234-5678-9101', pin: '987654321', date: '2025-02-20' },
        { id: 2, serial: 'WAE-1121-9101-5678', pin: '123456789', date: '2025-02-19' },
      ]}
    />
  );
};

export default WaecResultChecker;

