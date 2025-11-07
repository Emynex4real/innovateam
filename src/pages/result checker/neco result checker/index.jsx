import React from 'react';
import ResultCheckerService from '../../../components/ResultCheckerService';

const NecoResultChecker = () => {
  return (
    <ResultCheckerService
      examType="neco"
      title="NECO Result Checker"
      description="Purchase your NECO scratch cards with ease and check your results instantly"
      price={1300}
      serialPrefix="NEC"
    />
  );
};

export default NecoResultChecker;