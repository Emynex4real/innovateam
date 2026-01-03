import React from 'react';
import NavBar from '../Home/navBar/index';

const QuestionGenerator = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Question Generator</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 text-center">
            Question Generator feature coming soon...
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default QuestionGenerator;