import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { toast } from 'react-toastify';
import {
  LightBulbIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  AcademicCapIcon,
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ModernAiExaminer = () => {
  const { balance, deductFromWallet } = useWallet();
  const { isDarkMode } = useDarkMode();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: '📊' },
    { id: 'english', name: 'English Language', icon: '📚' },
    { id: 'physics', name: 'Physics', icon: '⚛️' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
    { id: 'biology', name: 'Biology', icon: '🧬' },
    { id: 'economics', name: 'Economics', icon: '💰' }
  ];

  const levels = [
    { id: 'waec', name: 'WAEC/SSCE', price: 500 },
    { id: 'jamb', name: 'JAMB/UTME', price: 750 },
    { id: 'post-utme', name: 'Post-UTME', price: 1000 }
  ];

  const features = [
    { icon: LightBulbIcon, title: 'AI-Powered Questions', description: 'Smart question generation based on past papers' },
    { icon: ChartBarIcon, title: 'Performance Analytics', description: 'Detailed analysis of your strengths and weaknesses' },
    { icon: ClockIcon, title: 'Timed Practice', description: 'Simulate real exam conditions with time limits' },
    { icon: CheckCircleIcon, title: 'Instant Feedback', description: 'Get immediate explanations for correct answers' }
  ];

  const handleStartExam = async () => {
    if (!selectedSubject || !selectedLevel) {
      toast.error('Please select both subject and level');
      return;
    }

    const selectedLevelData = levels.find(l => l.id === selectedLevel);
    if (balance < selectedLevelData.price) {
      toast.error('Insufficient wallet balance. Please fund your wallet.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await deductFromWallet(selectedLevelData.price, `AI Examiner - ${selectedSubject} (${selectedLevelData.name})`);
      if (result.success) {
        toast.success('Exam started successfully!');
        // Here you would navigate to the actual exam interface
      } else {
        toast.error(result.error || 'Failed to start exam');
      }
    } catch (error) {
      toast.error('An error occurred while starting the exam');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <LightBulbIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Examiner</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Practice with AI-generated questions and get instant feedback</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Exam Setup */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Start New Practice Session</h2>
              
              {/* Subject Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Subject</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedSubject === subject.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{subject.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Level</label>
                <div className="space-y-3">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedLevel === level.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{level.name}</div>
                          <div className="text-sm text-gray-600">Practice questions for {level.name} level</div>
                        </div>
                        <div className="text-lg font-bold text-purple-600">₦{level.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartExam}
                disabled={!selectedSubject || !selectedLevel || isLoading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Start Practice Session
                  </>
                )}
              </button>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <feature.icon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
              <p className="text-sm text-gray-600">Available for practice sessions</p>
            </div>

            {/* Recent Performance */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mathematics</p>
                    <p className="text-sm text-gray-600">JAMB Practice</p>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">English</p>
                    <p className="text-sm text-gray-600">WAEC Practice</p>
                  </div>
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-semibold">92%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Study Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Practice regularly for better retention</li>
                <li>• Review explanations for wrong answers</li>
                <li>• Time yourself to simulate exam conditions</li>
                <li>• Focus on weak areas identified by AI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAiExaminer;