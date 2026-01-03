import React from 'react';
import ResultCheckerTemplate from '../../../components/ResultCheckerTemplate';

const NabtebResultChecker = () => {
  return (
    <ResultCheckerTemplate
      title="NABTEB Result Checker"
      description="Purchase your NABTEB scratch cards securely and check your results instantly"
      pricePerCard={900}
      serialPrefix="NAB"
      initialCards={[]}
    />
  );
};

export default NabtebResultChecker;