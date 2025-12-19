import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const PublicTests = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPublicTests();
  }, []);

  const loadPublicTests = async () => {
    try {
      const response = await studentTCService.getPublicTests();
      if (response.success) {
        setTests(response.tests);
      }
    } catch (error) {
      toast.error('Failed to load public tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center p-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              🌍 Public Tests
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Practice tests available to everyone
            </p>
          </div>
          <button
            onClick={() => navigate('/student/centers')}
            className={`px-4 py-2 rounded-lg transition ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50 text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            My Centers
          </button>
        </div>

        {tests.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-12 text-center`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>No public tests available yet</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Check back later for new practice tests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border overflow-hidden hover:shadow-xl transition-shadow`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {test.title}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                      🌍 Public
                    </span>
                  </div>
                  
                  {test.description && (
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {test.description}
                    </p>
                  )}

                  <div className={`flex flex-wrap gap-3 text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>📝 {test.question_count?.[0]?.count || 0} questions</span>
                    <span>⏱️ {test.time_limit} min</span>
                    <span>🎯 {test.passing_score}% pass</span>
                  </div>

                  <div className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    By: {test.center?.name || 'Unknown'}
                  </div>

                  <button
                    onClick={() => navigate(`/student/test/${test.id}`)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Start Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTests;
