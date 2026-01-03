import React, { useEffect, useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';

const LOADING_TIPS = [
  "Did you know? The JAMB exam was established in 1978.",
  "Tip: Read all options before selecting an answer.",
  "Fact: Consistent practice improves retention by 40%.",
  "AI is analyzing past questions to generate the best match...",
  "Structuring questions for difficulty balance...",
  "Formatting mathematical equations...",
  "Validating options against the curriculum...",
  "Pro tip: Time management is key to JAMB success.",
  "Did you know? JAMB tests over 1.8 million candidates yearly."
];

const AIProgressLoader = ({ completed, total, batch, totalBatches }) => {
  const { isDarkMode } = useDarkMode();
  const [currentTip, setCurrentTip] = useState(0);
  const percentage = Math.min(100, Math.round((completed / total) * 100));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } rounded-2xl p-8 max-w-md w-full shadow-2xl border m-4`}>
        
        {/* Animated Spinner with Percentage */}
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <div className={`absolute inset-0 border-4 ${
              isDarkMode ? 'border-blue-900' : 'border-blue-200'
            } rounded-full animate-pulse`} />
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl text-blue-600">
              {percentage}%
            </div>
          </div>
        </div>

        <h3 className={`text-xl font-bold text-center mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Generating Questions
        </h3>
        
        <p className={`text-sm text-center mb-6 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Batch {batch} of {totalBatches}
        </p>

        {/* Progress Bar */}
        <div className={`w-full ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        } rounded-full h-3 mb-6 overflow-hidden`}>
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Tips Carousel */}
        <div className="h-12 relative overflow-hidden">
          <p
            key={currentTip}
            className={`text-sm text-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } italic absolute w-full transition-opacity duration-500`}
          >
            "{LOADING_TIPS[currentTip]}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIProgressLoader;
