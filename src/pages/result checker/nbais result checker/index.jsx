import React from 'react';
import ResultCheckerTemplate from '../../../components/ResultCheckerTemplate';

const NbaisResultChecker = () => {
  return (
    <ResultCheckerTemplate
      title="NBAIS Result Checker"
      description="Purchase your NBAIS scratch cards securely and check your results instantly"
      pricePerCard={1100}
      serialPrefix="NBA"
      initialCards={[]}
    />
  );
};

export default NbaisResultChecker;