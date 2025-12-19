import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';

const StudentTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [testsRes, attemptsRes] = await Promise.all([
        studentTCService.getAvailableTests(),
        studentTCService.getMyAttempts()
      ]);
      
      if (testsRes.success) {
        setTests(testsRes.questionSets);
      }
      if (attemptsRes.success) {
        const attemptsMap = {};
        attemptsRes.attempts.forEach(att => {
          if (!attemptsMap[att.question_set_id]) {
            attemptsMap[att.question_set_id] = [];
          }
          attemptsMap[att.question_set_id].push(att);
        });
        setAttempts(attemptsMap);
      }
    } catch (error) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const getAttemptInfo = (testId) => {
    const testAttempts = attempts[testId] || [];
    const firstAttempt = testAttempts.find(a => a.is_first_attempt);
    return {
      count: testAttempts.length,
      bestScore: testAttempts.length > 0 ? Math.max(...testAttempts.map(a => a.score)) : null,
      firstScore: firstAttempt?.score
    };
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Tests</h1>

      {tests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No tests available yet</p>
          <p className="text-sm text-gray-400">Your tutor will create tests for you</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => {
            const info = getAttemptInfo(test.id);
            return (
              <div key={test.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{test.title}</h3>
                    {test.description && <p className="text-gray-600 mb-3">{test.description}</p>}
                    <div className="flex gap-6 text-sm text-gray-600 mb-4">
                      <span>📝 {test.question_count?.[0]?.count || 0} questions</span>
                      <span>⏱️ {test.time_limit} minutes</span>
                      <span>🎯 {test.passing_score}% to pass</span>
                    </div>
                    
                    {info.count > 0 && (
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-600">Attempts: {info.count}</span>
                        {info.firstScore !== null && (
                          <span className={info.firstScore >= test.passing_score ? 'text-green-600' : 'text-orange-600'}>
                            First: {info.firstScore}%
                          </span>
                        )}
                        {info.bestScore !== null && (
                          <span className="text-purple-600">Best: {info.bestScore}%</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/student/test/${test.id}`)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {info.count > 0 ? 'Retake' : 'Start Test'}
                    </button>
                    {info.count > 0 && (
                      <button
                        onClick={() => navigate(`/student/results/${test.id}`)}
                        className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Results
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentTests;
