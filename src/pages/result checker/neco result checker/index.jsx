import React from 'react';
import ResultCheckerTemplate from '../../../components/ResultCheckerTemplate';

const NecoResultChecker = () => {
  return (
    <ResultCheckerTemplate
      title="NECO Result Checker"
      description="Purchase your NECO scratch cards with ease and check your results instantly"
      pricePerCard={1300}
      serialPrefix="NEC"
      initialCards={[
        { id: 1, serial: 'NEC-1234-5678-9101', pin: '987654321', date: '2025-02-20' },
        { id: 2, serial: 'NEC-1121-9101-5678', pin: '123456789', date: '2025-02-19' },
      ]}
    />
  );
};

export default NecoResultChecker;