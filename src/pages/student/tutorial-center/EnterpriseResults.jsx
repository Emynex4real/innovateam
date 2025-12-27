import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import studentTCService from '../../../services/studentTC.service';
import tutorialCenterService from '../../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { componentStyles } from '../../../styles/designSystem';

const EnterpriseResults = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingRemedial, setGeneratingRemedial] = useState(false);

  useEffect(() => {
    loadData();
  }, [testId]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/student/tests')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to Tests
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{test?.title} - Results</h1>
          <p className="text-gray-600">Your performance history</p>
        </motion.div>

        {attempts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={componentStyles.card.default + ' text-center py-12'}
          >
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Attempts Yet</h2>
            <p className="text-gray-600 mb-6">Take the test to see your results</p>
            <button
              onClick={() => navigate(`/student/test/${testId}`)}
              className={componentStyles.button.primary}
            >
              Start Test
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {attempts.map((attempt, idx) => {
              const passed = attempt.score >= test.passing_score;
              const correctCount = Math.round(attempt.score * attempt.total_questions / 100);
              
              return (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={componentStyles.card.default}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          Attempt {attempts.length - idx}
                        </h3>
                        {attempt.is_first_attempt && (
                          <span className={componentStyles.badge.info}>First Attempt</span>
                        )}
                        {attempt.integrity_score && attempt.integrity_score < 80 && (
                          <span className={componentStyles.badge.warning}>
                            Integrity: {attempt.integrity_score}%
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>📅 {new Date(attempt.completed_at).toLocaleString()}</span>
                        <span>⏱️ {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/student/test/${testId}`)}
                      className={componentStyles.button.secondary}
                    >
                      Retake
                    </button>
                  </div>

                  {/* Score Display */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className={`text-5xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                        {attempt.score}%
                      </div>
                      <p className="text-sm text-gray-600">Final Score</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="text-5xl font-bold text-blue-600 mb-2">
                        {correctCount}/{attempt.total_questions}
                      </div>
                      <p className="text-sm text-gray-600">Correct Answers</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <div className={`text-5xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                        {passed ? '✓' : '✗'}
                      </div>
                      <p className="text-sm text-gray-600">
                        {passed ? 'Passed' : 'Failed'} (Need {test.passing_score}%)
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {test.show_answers && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/student/review/${attempt.id}`)}
                        className={componentStyles.button.primary}
                      >
                        Review Answers
                      </button>
                      {attempt.score < 50 && (
                        <button
                          onClick={() => handleRemedial(attempt.id)}
                          disabled={generatingRemedial}
                          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                        >
                          {generatingRemedial ? 'Generating...' : '📚 Practice Weak Areas'}
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseResults;
