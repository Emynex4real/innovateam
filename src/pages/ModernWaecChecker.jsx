import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { toast } from 'react-toastify';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const ModernWaecChecker = () => {
  const { balance, deductFromWallet } = useWallet();
  const { isDarkMode } = useDarkMode();
  const [examNumber, setExamNumber] = useState('');
  const [examYear, setExamYear] = useState('');
  const [scratchCardPin, setScratchCardPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const SERVICE_PRICE = 200;

  const handleCheckResult = async (e) => {
    e.preventDefault();
    
    if (!examNumber || !examYear || !scratchCardPin) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (balance < SERVICE_PRICE) {
      toast.error('Insufficient wallet balance. Please fund your wallet.');
      return;
    }

    setIsLoading(true);
    try {
      const deductResult = await deductFromWallet(SERVICE_PRICE, 'WAEC Result Checker');
      if (deductResult.success) {
        // Simulate result checking
        setTimeout(() => {
          setResult({
            examNumber,
            examYear,
            candidateName: 'JOHN DOE STUDENT',
            subjects: [
              { name: 'Mathematics', grade: 'B3' },
              { name: 'English Language', grade: 'C4' },
              { name: 'Physics', grade: 'A1' },
              { name: 'Chemistry', grade: 'B2' },
              { name: 'Biology', grade: 'C5' },
              { name: 'Economics', grade: 'B3' }
            ]
          });
          setIsLoading(false);
          toast.success('Result retrieved successfully!');
        }, 2000);
      } else {
        setIsLoading(false);
        toast.error(deductResult.error || 'Failed to process payment');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('An error occurred while checking result');
    }
  };

  const getGradeColor = (grade) => {
    const gradeValue = grade.charAt(0);
    switch (gradeValue) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>WAEC Result Checker</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Check your WAEC/SSCE examination results</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Result Checker Form */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Enter Your Details</h2>
                
                <form onSubmit={handleCheckResult} className="space-y-6">
                  <div>
                    <label htmlFor="examNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Examination Number
                    </label>
                    <input
                      type="text"
                      id="examNumber"
                      value={examNumber}
                      onChange={(e) => setExamNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your exam number"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="examYear" className="block text-sm font-medium text-gray-700 mb-2">
                      Examination Year
                    </label>
                    <select
                      id="examYear"
                      value={examYear}
                      onChange={(e) => setExamYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select year</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="scratchCardPin" className="block text-sm font-medium text-gray-700 mb-2">
                      Scratch Card PIN
                    </label>
                    <input
                      type="text"
                      id="scratchCardPin"
                      value={scratchCardPin}
                      onChange={(e) => setScratchCardPin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter scratch card PIN"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Service Fee: ₦{SERVICE_PRICE}</span>
                    </div>
                    <p className="text-sm text-blue-800 mt-1">
                      This amount will be deducted from your wallet balance
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || balance < SERVICE_PRICE}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Checking Result...
                      </>
                    ) : (
                      <>
                        <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                        Check Result
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Result Display */
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">WAEC Result</h2>
                  <button
                    onClick={() => {
                      setResult(null);
                      setExamNumber('');
                      setExamYear('');
                      setScratchCardPin('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Check Another Result
                  </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Candidate Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{result.candidateName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Exam Number:</span>
                      <span className="ml-2 font-medium">{result.examNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Year:</span>
                      <span className="ml-2 font-medium">{result.examYear}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Subject Results</h3>
                  <div className="space-y-3">
                    {result.subjects.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{subject.name}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Balance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Wallet Balance</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">₦{(balance || 0).toLocaleString()}</div>
              <p className="text-sm text-gray-600">Available for services</p>
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Service Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>Instant result retrieval</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>Secure and reliable</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>Official WAEC database</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Available 24/7</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
              <h3 className="font-semibold text-yellow-900 mb-3">Need Help?</h3>
              <ul className="text-sm text-yellow-800 space-y-2">
                <li>• Ensure your exam number is correct</li>
                <li>• Check that you have a valid scratch card PIN</li>
                <li>• Contact support if you encounter issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernWaecChecker;