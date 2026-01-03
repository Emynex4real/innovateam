import React from 'react';
import ResultCheckerTemplate from '../../../components/ResultCheckerTemplate';

const WaecGce = () => {
  return (
    <ResultCheckerTemplate
      title="WAEC GCE"
      description="Purchase your WAEC GCE registration and check your results instantly"
      pricePerCard={28000}
      serialPrefix="GCE"
      initialCards={[]}
    />
  );
};

export default WaecGce;