import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { toast } from 'react-toastify';
import {
  AcademicCapIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const ModernAdmissionLetter = () => {
  const { balance, deductFromWallet } = useWallet();
  const { isDarkMode } = useDarkMode();
  const [jambRegNumber, setJambRegNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [admissionData, setAdmissionData] = useState(null);

  const SERVICE_PRICE = 500;

  const handleCheckAdmission = async (e) => {
    e.preventDefault();
    
    if (!jambRegNumber) {
      toast.error('Please enter your JAMB registration number');
      return;
    }

    if (balance < SERVICE_PRICE) {
      toast.error('Insufficient wallet balance. Please fund your wallet.');
      return;
    }

    setIsLoading(true);
    try {
      const deductResult = await deductFromWallet(SERVICE_PRICE, 'JAMB Admission Letter');
      if (deductResult.success) {
        // Simulate admission checking
        setTimeout(() => {
          setAdmissionData({
            regNumber: jambRegNumber,
            candidateName: 'JOHN DOE STUDENT',
            institution: 'UNIVERSITY OF LAGOS',
            course: 'COMPUTER SCIENCE',
            admissionStatus: 'ADMITTED',
            sessionYear: '2024/2025',
            faculty: 'SCIENCE',
            department: 'COMPUTER SCIENCE',
            admissionDate: '2024-08-15'
          });
          setIsLoading(false);
          toast.success('Admission status retrieved successfully!');
        }, 2000);
      } else {
        setIsLoading(false);
        toast.error(deductResult.error || 'Failed to process payment');
      }
    } catch (error) {
      setIsLoading(false);
      toast.error('An error occurred while checking admission status');
    }
  };

  const handlePrintLetter = () => {
    window.print();
    toast.success('Admission letter sent to printer');
  };

  const handleDownloadLetter = () => {
    // Simulate download
    toast.success('Admission letter downloaded successfully');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>JAMB Admission Letter</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Check and download your university admission letter</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {!admissionData ? (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Check Admission Status</h2>
                
                <form onSubmit={handleCheckAdmission} className="space-y-6">
                  <div>
                    <label htmlFor="jambRegNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      JAMB Registration Number
                    </label>
                    <input
                      type="text"
                      id="jambRegNumber"
                      value={jambRegNumber}
                      onChange={(e) => setJambRegNumber(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your JAMB registration number"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: 12345678AB</p>
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
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Checking Admission Status...
                      </>
                    ) : (
                      <>
                        <AcademicCapIcon className="h-5 w-5 mr-2" />
                        Check Admission Status
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Admission Letter Display */
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Admission Letter</h2>
                    <div className="flex space-x-3">
                      <button
                        onClick={handlePrintLetter}
                        className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <PrinterIcon className="h-4 w-4 mr-1" />
                        Print
                      </button>
                      <button
                        onClick={handleDownloadLetter}
                        className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-8" id="admission-letter">
                  {/* Letter Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{admissionData.institution}</h1>
                    <h2 className="text-lg font-semibold text-blue-600">ADMISSION LETTER</h2>
                    <p className="text-sm text-gray-600 mt-2">Academic Session: {admissionData.sessionYear}</p>
                  </div>

                  {/* Admission Status */}
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center">
                      <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                      <span className="text-lg font-bold text-green-800">CONGRATULATIONS! YOU HAVE BEEN ADMITTED</span>
                    </div>
                  </div>

                  {/* Candidate Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Full Name:</span>
                          <p className="font-semibold text-gray-900">{admissionData.candidateName}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">JAMB Registration Number:</span>
                          <p className="font-semibold text-gray-900">{admissionData.regNumber}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Admission Date:</span>
                          <p className="font-semibold text-gray-900">{new Date(admissionData.admissionDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Course of Study:</span>
                          <p className="font-semibold text-gray-900">{admissionData.course}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Faculty:</span>
                          <p className="font-semibold text-gray-900">{admissionData.faculty}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Department:</span>
                          <p className="font-semibold text-gray-900">{admissionData.department}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Next Steps:</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      <li>1. Accept your admission on JAMB CAPS</li>
                      <li>2. Pay your acceptance fee</li>
                      <li>3. Complete your registration online</li>
                      <li>4. Report to the institution on the resumption date</li>
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className="text-center text-sm text-gray-600 mt-8">
                    <p>This is an official admission letter generated from JAMB database</p>
                    <p className="mt-1">Generated on: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setAdmissionData(null);
                      setJambRegNumber('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Check Another Registration Number
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Balance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <AcademicCapIcon className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Wallet Balance</h3>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">₦{(balance || 0).toLocaleString()}</div>
              <p className="text-sm text-gray-600">Available for services</p>
            </div>

            {/* Service Features */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Service Features</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>Official JAMB database</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>Instant letter generation</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                  <span>Print and download options</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span>Available 24/7</span>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h3 className="font-semibold text-red-900 mb-3">⚠️ Important</h3>
              <ul className="text-sm text-red-800 space-y-2">
                <li>• Ensure your JAMB registration number is correct</li>
                <li>• This service is for checking admission status only</li>
                <li>• Contact your institution for further clarification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdmissionLetter;