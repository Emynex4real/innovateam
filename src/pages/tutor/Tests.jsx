import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Tests = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const response = await tutorialCenterService.getQuestionSets();
      if (response.success) {
        setTests(response.questionSets);
      }
    } catch (error) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswers = async (id, currentState) => {
    try {
      await tutorialCenterService.toggleAnswers(id, !currentState);
      toast.success(`Answers ${!currentState ? 'revealed' : 'hidden'}`);
      loadTests();
    } catch (error) {
      toast.error('Failed to toggle answers');
    }
  };

  const toggleActive = async (id, currentState) => {
    const newState = !currentState;
    console.log('Toggle active request:', { id, currentState, newState });
    
    try {
      await tutorialCenterService.updateQuestionSet(id, { is_active: newState });
      toast.success(`Test ${newState ? 'activated' : 'deactivated'}`);
      loadTests();
    } catch (error) {
      console.error('Toggle active error:', error.response?.data || error);
      toast.error(error.response?.data?.error || 'Failed to update test');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test? This cannot be undone.')) return;
    try {
      await tutorialCenterService.deleteQuestionSet(id);
      toast.success('Test deleted');
      loadTests();
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  if (loading) {
    return <div className={`flex justify-center p-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tutor')}
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition`}
            >
              ← Back
            </button>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tests</h1>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/tutor/analytics/advanced')}
              className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-semibold"
            >
              📊 Advanced Analytics
            </button>
            <button
              onClick={() => navigate('/tutor/tests/create')}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Create Test
            </button>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-8 md:p-12 text-center`}>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>No tests created yet</p>
            <button
              onClick={() => navigate('/tutor/tests/create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Test
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <div key={test.id} className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6`}>
                <div 
                  onClick={() => navigate(`/tutor/tests/${test.id}`)}
                  className="cursor-pointer hover:opacity-80 transition"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                        <h3 className="text-lg md:text-xl font-bold">{test.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs md:text-sm ${
                          test.is_active 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {test.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {test.description && <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-3 text-sm md:text-base`}>{test.description}</p>}
                      <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm">
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>📝 {test.question_count?.[0]?.count || 0} questions</span>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>⏱️ {test.time_limit} minutes</span>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>🎯 {test.passing_score}% to pass</span>
                        <span className={test.visibility === 'public' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}>
                          {test.visibility === 'public' ? '🌍 Public' : '🔒 Private'}
                        </span>
                        <span className={test.show_answers ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
                          {test.show_answers ? '✓ Answers visible' : '✗ Answers hidden'}
                        </span>
                      </div>
                      {(test.scheduled_start || test.is_recurring) && (
                        <div className={`mt-2 p-2 rounded ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} text-xs`}>
                          {test.scheduled_start && (
                            <div className="flex items-center gap-2">
                              <span>📅</span>
                              <span>Start: {new Date(test.scheduled_start).toLocaleString()}</span>
                              {test.scheduled_end && <span>• End: {new Date(test.scheduled_end).toLocaleString()}</span>}
                            </div>
                          )}
                          {test.is_recurring && (
                            <div className="flex items-center gap-2 mt-1">
                              <span>🔄</span>
                              <span>Recurring: {test.recurrence_pattern}</span>
                              {test.next_activation_at && <span>• Next: {new Date(test.next_activation_at).toLocaleString()}</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="w-full lg:w-auto" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/tutor/leaderboard/${test.id}`)}
                        className="w-full lg:w-auto px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition text-sm md:text-base"
                      >
                        Leaderboard
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`flex flex-wrap gap-2 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/tutor/tests/${test.id}`)}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm md:text-base font-semibold"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => toggleActive(test.id, test.is_active)}
                    className={`flex-1 sm:flex-none px-3 md:px-4 py-2 rounded-lg transition text-sm md:text-base ${
                      test.is_active
                        ? isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                    }`}
                  >
                    {test.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => toggleAnswers(test.id, test.show_answers)}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition text-sm md:text-base"
                  >
                    {test.show_answers ? 'Hide Answers' : 'Show Answers'}
                  </button>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition text-sm md:text-base"
                  >
                    Delete
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

export default Tests;
