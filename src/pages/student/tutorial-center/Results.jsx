import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';

const Results = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [testId]);

  const loadData = async () => {
    try {
      const [attemptsRes, testRes] = await Promise.all([
        studentTCService.getMyAttempts(testId),
        studentTCService.getTest(testId)
      ]);
      
      if (attemptsRes.success) {
        setAttempts(attemptsRes.attempts);
      }
      if (testRes.success) {
        setTest(testRes.questionSet);
      }
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{test?.title} - Results</h1>
        <button
          onClick={() => navigate('/student/tests')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Tests
        </button>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">No attempts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt, idx) => (
            <div key={attempt.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">
                      Attempt {attempts.length - idx}
                    </h3>
                    {attempt.is_first_attempt && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        First Attempt
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-6 text-sm text-gray-600 mb-3">
                    <span>📅 {new Date(attempt.completed_at).toLocaleString()}</span>
                    <span>⏱️ {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-bold ${
                      attempt.score >= test.passing_score ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {attempt.score}%
                    </div>
                    <div className="text-gray-600">
                      <p className="text-lg">
                        {Math.round(attempt.score * attempt.total_questions / 100)}/{attempt.total_questions} correct
                      </p>
                      <p className="text-sm">
                        {attempt.score >= test.passing_score ? '✓ Passed' : '✗ Failed'} 
                        (Need {test.passing_score}%)
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/student/test/${testId}`)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retake
                </button>
              </div>

              {test.show_answers && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-green-600">✓ Answers and explanations are available</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
