import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const TestDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('questions');
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestData();
  }, [testId]);

  const loadTestData = async () => {
    try {
      setLoading(true);
      const [testRes, questionsRes, attemptsRes] = await Promise.all([
        tutorialCenterService.getQuestionSets(),
        tutorialCenterService.getTestQuestions(testId),
        tutorialCenterService.getCenterAttempts()
      ]);

      if (testRes.success) {
        const foundTest = testRes.questionSets.find(t => String(t.id) === String(testId));
        setTest(foundTest);
      }
      if (questionsRes.success) setQuestions(questionsRes.questions);
      if (attemptsRes.success) {
        const testAttempts = attemptsRes.attempts.filter(a => String(a.question_set_id) === String(testId));
        setAttempts(testAttempts);
      }
    } catch (error) {
      console.error('Error loading test data:', error);
      toast.error('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await tutorialCenterService.deleteQuestion(questionId);
      toast.success('Question deleted');
      loadTestData();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const toggleActive = async () => {
    try {
      await tutorialCenterService.updateQuestionSet(test.id, { is_active: !test.is_active });
      toast.success(`Test ${!test.is_active ? 'activated' : 'deactivated'}`);
      loadTestData();
    } catch (error) {
      toast.error('Failed to update test');
    }
  };

  const handleDeleteTest = async () => {
    if (!window.confirm('Delete this test? This cannot be undone.')) return;
    try {
      await tutorialCenterService.deleteQuestionSet(test.id);
      toast.success('Test deleted');
      navigate('/tutor/tests');
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
        <div className="text-center">
          <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>Test not found</p>
          <button onClick={() => navigate('/tutor/tests')} className="mt-4 text-blue-600">← Back to Tests</button>
        </div>
      </div>
    );
  }

  const passRate = attempts.length > 0 
    ? Math.round((attempts.filter(a => a.score >= test.passing_score).length / attempts.length) * 100)
    : 0;
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
    : 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/tutor/tests')}
            className={`mb-4 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
          >
            ← Back to Tests
          </button>
          
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {test.title}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    test.is_active 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {test.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {test.description && (
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{test.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>📝 {questions.length} questions</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>⏱️ {test.time_limit} min</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>🎯 {test.passing_score}% pass</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>👥 {attempts.length} attempts</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleActive}
                  className={`px-4 py-2 rounded-lg transition ${
                    test.is_active
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                      : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200'
                  }`}
                >
                  {test.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={handleDeleteTest}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 transition"
                >
                  Delete Test
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
          <div className={`flex border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {['questions', 'analytics', 'settings', 'attempts'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 font-semibold capitalize transition ${
                  activeTab === tab
                    ? isDarkMode 
                      ? 'bg-blue-900 text-blue-200 border-b-2 border-blue-500'
                      : 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Questions ({questions.length})
                  </h2>
                  <button
                    onClick={() => navigate('/tutor/questions')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Questions
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>No questions added yet</p>
                    <button
                      onClick={() => navigate('/tutor/questions')}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Add Your First Question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Q{idx + 1}.
                              </span>
                              <p className={`flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {q.question_text}
                              </p>
                            </div>
                            <div className="ml-8 space-y-2">
                              {q.options?.map((option, i) => {
                                // Handle both formats: "A. Text" or just "Text"
                                const optionLetter = ['A', 'B', 'C', 'D'][i];
                                const optionText = typeof option === 'string' && option.match(/^[A-D]\.\s/) 
                                  ? option.substring(3) 
                                  : option;
                                
                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-2 p-2 rounded ${
                                      optionLetter === q.correct_answer
                                        ? isDarkMode
                                          ? 'bg-green-900/30 text-green-300'
                                          : 'bg-green-50 text-green-700'
                                        : isDarkMode
                                          ? 'text-gray-300'
                                          : 'text-gray-700'
                                    }`}
                                  >
                                    <span className="font-semibold">{optionLetter}.</span>
                                    <span>{optionText}</span>
                                    {optionLetter === q.correct_answer && <span className="ml-auto">✓</span>}
                                  </div>
                                );
                              })}
                            </div>
                            {q.explanation && (
                              <div className={`ml-8 mt-3 p-3 rounded ${
                                isDarkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'
                              }`}>
                                <span className="font-semibold">Explanation: </span>
                                {q.explanation}
                              </div>
                            )}
                            <div className="ml-8 mt-2 flex flex-wrap gap-2 text-xs">
                              {q.subject && (
                                <span className={`px-2 py-1 rounded ${
                                  isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  {q.subject}
                                </span>
                              )}
                              {q.topic && (
                                <span className={`px-2 py-1 rounded ${
                                  isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {q.topic}
                                </span>
                              )}
                              {q.difficulty && (
                                <span className={`px-2 py-1 rounded ${
                                  q.difficulty === 'easy'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    : q.difficulty === 'medium'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                }`}>
                                  {q.difficulty}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Test Analytics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Attempts</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {attempts.length}
                    </p>
                  </div>
                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pass Rate</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {passRate}%
                    </p>
                  </div>
                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Average Score</p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {avgScore}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/tutor/leaderboard/${test.id}`)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  View Full Leaderboard
                </button>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Test Settings
                </h2>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Time Limit</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{test.time_limit} minutes</p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Passing Score</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{test.passing_score}%</p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Visibility</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {test.visibility === 'public' ? '🌍 Public' : '🔒 Private'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Show Answers</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {test.show_answers ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Max Attempts</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {test.max_attempts || 'Unlimited'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Cooldown Period</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {test.cooldown_hours ? `${test.cooldown_hours} hours` : 'No cooldown'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Score Policy</p>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {test.score_policy === 'best' && '🏆 Best Score'}
                      {test.score_policy === 'average' && '📊 Average Score'}
                      {test.score_policy === 'last' && '🔄 Last Attempt'}
                      {test.score_policy === 'first' && '1️⃣ First Attempt'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Attempts Tab */}
            {activeTab === 'attempts' && (
              <div>
                <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Attempts ({attempts.length})
                </h2>
                {attempts.length === 0 ? (
                  <p className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No attempts yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {attempts.slice(0, 20).map(attempt => (
                      <div
                        key={attempt.id}
                        className={`p-4 rounded-lg border ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Student ID: {attempt.student_id}
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(attempt.completed_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${
                              attempt.score >= test.passing_score
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {attempt.score}%
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {attempt.score >= test.passing_score ? 'Passed' : 'Failed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;
