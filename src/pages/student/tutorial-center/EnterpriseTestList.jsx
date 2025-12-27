import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import studentTCService from '../../../services/studentTC.service';
import tutorialCenterService from '../../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { componentStyles } from '../../../styles/designSystem';

const EnterpriseTestList = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [mastery, setMastery] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [testsRes, attemptsRes, masteryRes] = await Promise.all([
        studentTCService.getAvailableTests(),
        studentTCService.getMyAttempts(),
        tutorialCenterService.getMyMastery()
      ]);
      
      if (testsRes.success) setTests(testsRes.questionSets);
      if (attemptsRes.success) {
        const attemptsMap = {};
        attemptsRes.attempts.forEach(att => {
          if (!attemptsMap[att.question_set_id]) attemptsMap[att.question_set_id] = [];
          attemptsMap[att.question_set_id].push(att);
        });
        setAttempts(attemptsMap);
      }
      if (masteryRes.success) {
        const masteryMap = {};
        masteryRes.mastery?.forEach(m => {
          masteryMap[m.question_set_id] = m.mastery_level;
        });
        setMastery(masteryMap);
      }
    } catch (error) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const getTestInfo = (testId) => {
    const testAttempts = attempts[testId] || [];
    const firstAttempt = testAttempts.find(a => a.is_first_attempt);
    return {
      attempted: testAttempts.length > 0,
      bestScore: testAttempts.length ? Math.max(...testAttempts.map(a => a.score)) : 0,
      firstScore: firstAttempt?.score || null,
      attemptCount: testAttempts.length,
      mastery: mastery[testId] || 0
    };
  };

  const checkAccess = async (testId) => {
    try {
      const response = await tutorialCenterService.checkTestAccess(testId);
      if (!response.unlocked) {
        toast.error(`Complete prerequisite test first (${response.required_mastery}% required)`);
        return false;
      }
      return true;
    } catch (error) {
      return true;
    }
  };

  const handleStartTest = async (testId) => {
    const canAccess = await checkAccess(testId);
    if (canAccess) {
      navigate(`/student/test/${testId}`);
    }
  };

  const filteredTests = tests.filter(test => {
    const info = getTestInfo(test.id);
    if (filter === 'completed') return info.attempted;
    if (filter === 'pending') return !info.attempted;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Tests 📝</h1>
            <p className="text-gray-600">Choose a test to start practicing</p>
          </div>
          <button
            onClick={() => {
              const centers = JSON.parse(localStorage.getItem('myCenters') || '[]');
              if (centers.length > 0) {
                navigate(`/student/analytics/${centers[0].center_id}`);
              } else {
                toast.error('Join a tutorial center first');
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold flex items-center gap-2"
          >
            📊 View Analytics
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                filter === f
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={componentStyles.card.default + ' text-center py-12'}
          >
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tests Found</h2>
            <p className="text-gray-600">Check back later for new tests</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test, idx) => {
              const info = getTestInfo(test.id);
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={componentStyles.card.interactive}
                  onClick={() => navigate(`/student/test/${test.id}`)}
                >
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-4">
                    {info.attempted ? (
                      <span className={componentStyles.badge.success}>Completed</span>
                    ) : (
                      <span className={componentStyles.badge.info}>New</span>
                    )}
                    {info.mastery > 0 && (
                      <span className="text-sm font-semibold text-green-600">
                        🎓 {info.mastery}%
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
                  {test.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      📝 {test.question_count?.[0]?.count || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ {test.time_limit} min
                    </span>
                    <span className="flex items-center gap-1">
                      🎯 {test.passing_score}%
                    </span>
                    {info.attemptCount > 0 && (
                      <>
                        <span className="text-blue-600">Attempts: {info.attemptCount}</span>
                        {info.firstScore !== null && (
                          <span className={info.firstScore >= test.passing_score ? 'text-green-600' : 'text-orange-600'}>
                            First: {info.firstScore}%
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Score */}
                  {info.attempted && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Best Score</span>
                        <span className={`text-lg font-bold ${
                          info.bestScore >= test.passing_score ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {info.bestScore}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex gap-2">
                    <button
                      className={componentStyles.button.primary + ' flex-1'}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTest(test.id);
                      }}
                    >
                      {info.attempted ? 'Retake Test' : 'Start Test'}
                    </button>
                    {info.attempted && (
                      <button
                        className={componentStyles.button.secondary}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/student/results/${test.id}`);
                        }}
                      >
                        Results
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseTestList;
