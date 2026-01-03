import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import tutorialCenterService from '../../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const EnterpriseResults = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [attempts, setAttempts] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingRemedial, setGeneratingRemedial] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    loadData();
  }, [testId]);

  useEffect(() => {
    if (attempts.length > 0 && !selectedAttempt) {
      setSelectedAttempt(attempts[0]);
    }
  }, [attempts]);

  const loadData = async () => {
    try {
      const [attemptsRes, testRes] = await Promise.all([
        studentTCService.getMyAttempts(testId),
        studentTCService.getTest(testId)
      ]);
      
      if (attemptsRes.success) setAttempts(attemptsRes.attempts);
      if (testRes.success) setTest(testRes.questionSet);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleRemedial = async (attemptId) => {
    setGeneratingRemedial(true);
    try {
      const res = await tutorialCenterService.generateRemedialTest(attemptId);
      if (res.success) {
        toast.success('Practice test created!');
        navigate(`/student/test/${res.remedial_test.id}`);
      }
    } catch (error) {
      toast.error('Failed to generate practice test');
    } finally {
      setGeneratingRemedial(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading results...</p>
        </div>
      </div>
    );
  }

  const bestAttempt = attempts.reduce((best, curr) => curr.score > best.score ? curr : best, attempts[0]);
  const avgScore = attempts.reduce((sum, att) => sum + att.score, 0) / attempts.length;
  const improvement = attempts.length > 1 ? attempts[0].score - attempts[attempts.length - 1].score : 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/tests')}
            className={`mb-4 flex items-center gap-2 font-semibold transition-all hover:scale-105 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            ← Back to Tests
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{test?.title}</h1>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Performance Analysis</p>
            </div>
            <button
              onClick={() => navigate(`/student/test/${testId}`)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all shadow-lg hover:scale-105"
            >
              🔄 Retake Test
            </button>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl text-center py-16`}>
            <div className="text-6xl mb-4">📝</div>
            <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No Attempts Yet</h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Take the test to see your results</p>
            <button
              onClick={() => navigate(`/student/test/${testId}`)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all shadow-lg"
            >
              Start Test
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl border border-green-700' : 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl'} rounded-2xl p-6 text-white`}>
                <div className="text-sm mb-2 opacity-90">Best Score</div>
                <div className="text-4xl font-bold mb-1">{bestAttempt.score}%</div>
                <div className="text-xs opacity-75">Attempt {attempts.indexOf(bestAttempt) + 1}</div>
              </div>
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-xl border border-blue-700' : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl'} rounded-2xl p-6 text-white`}>
                <div className="text-sm mb-2 opacity-90">Average Score</div>
                <div className="text-4xl font-bold mb-1">{avgScore.toFixed(1)}%</div>
                <div className="text-xs opacity-75">{attempts.length} attempts</div>
              </div>
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-xl border border-orange-700' : 'bg-gradient-to-br from-orange-500 to-red-600 shadow-xl'} rounded-2xl p-6 text-white`}>
                <div className="text-sm mb-2 opacity-90">Improvement</div>
                <div className="text-4xl font-bold mb-1">{improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%</div>
                <div className="text-xs opacity-75">{improvement >= 0 ? 'Great progress!' : 'Keep practicing'}</div>
              </div>
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-purple-700' : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl'} rounded-2xl p-6 text-white`}>
                <div className="text-sm mb-2 opacity-90">Pass Rate</div>
                <div className="text-4xl font-bold mb-1">{Math.round(attempts.filter(a => a.score >= test.passing_score).length / attempts.length * 100)}%</div>
                <div className="text-xs opacity-75">{attempts.filter(a => a.score >= test.passing_score).length}/{attempts.length} passed</div>
              </div>
            </div>

            {/* Latest Attempt Details */}
            {selectedAttempt && (
              <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-xl'} rounded-2xl p-8 mb-8`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Latest Attempt
                      </h3>
                      {selectedAttempt.is_first_attempt && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold">First Attempt</span>
                      )}
                      {selectedAttempt.score >= test.passing_score && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold">✓ Passed</span>
                      )}
                    </div>
                    <div className={`flex gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span>📅 {new Date(selectedAttempt.completed_at).toLocaleString()}</span>
                      <span>⏱️ {Math.floor(selectedAttempt.time_taken / 60)}m {selectedAttempt.time_taken % 60}s</span>
                    </div>
                  </div>
                </div>

                {/* Score Visualization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className={`text-center p-8 rounded-2xl ${selectedAttempt.score >= test.passing_score ? isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-gradient-to-br from-green-50 to-emerald-50' : isDarkMode ? 'bg-red-900/30 border border-red-700' : 'bg-gradient-to-br from-red-50 to-orange-50'}`}>
                    <div className={`text-6xl font-bold mb-2 ${selectedAttempt.score >= test.passing_score ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAttempt.score}%
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Final Score</p>
                    <div className={`mt-4 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div 
                        className={`h-full ${selectedAttempt.score >= test.passing_score ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-orange-600'}`}
                        style={{ width: `${selectedAttempt.score}%` }}
                      />
                    </div>
                  </div>
                  <div className={`text-center p-8 rounded-2xl ${isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
                    <div className="text-6xl font-bold text-blue-600 mb-2">
                      {Math.round(selectedAttempt.score * selectedAttempt.total_questions / 100)}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Correct Answers</p>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>out of {selectedAttempt.total_questions}</p>
                  </div>
                  <div className={`text-center p-8 rounded-2xl ${isDarkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                    <div className={`text-6xl mb-2 ${selectedAttempt.score >= test.passing_score ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAttempt.score >= test.passing_score ? '✓' : '✗'}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedAttempt.score >= test.passing_score ? 'Passed' : 'Failed'}
                    </p>
                    <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Required: {test.passing_score}%</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {test.show_answers && (
                    <button
                      onClick={() => navigate(`/student/review/${selectedAttempt.id}`)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold transition-all shadow-lg"
                    >
                      📖 Review Answers
                    </button>
                  )}
                  {selectedAttempt.score < 70 && (
                    <button
                      onClick={() => handleRemedial(selectedAttempt.id)}
                      disabled={generatingRemedial}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 font-semibold transition-all shadow-lg disabled:opacity-50"
                    >
                      {generatingRemedial ? '⏳ Generating...' : '📚 Practice Weak Areas'}
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/student/tests')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    📝 More Tests
                  </button>
                </div>
              </div>
            )}

            {/* Attempt History */}
            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Attempt History</h3>
              <div className="space-y-3">
                {attempts.map((attempt, idx) => {
                  const passed = attempt.score >= test.passing_score;
                  return (
                    <div
                      key={attempt.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.01] ${
                        selectedAttempt?.id === attempt.id
                          ? isDarkMode ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
                          : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAttempt(attempt)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${passed ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                            #{attempts.length - idx}
                          </div>
                          <div>
                            <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Score: {attempt.score}% {passed ? '✓' : '✗'}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(attempt.completed_at).toLocaleDateString()} • {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s
                            </div>
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                          {attempt.score}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnterpriseResults;
