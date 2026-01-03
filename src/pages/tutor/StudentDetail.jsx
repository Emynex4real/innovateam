import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttempts();
  }, [studentId]);

  const loadAttempts = async () => {
    try {
      const response = await tutorialCenterService.getStudentAttempts(studentId);
      if (response.success) {
        setAttempts(response.attempts);
      }
    } catch (error) {
      toast.error('Failed to load attempts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <button onClick={() => navigate('/tutor/students')} className="mb-4 text-blue-600 hover:underline">
        ← Back to Students
      </button>

      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Student Attempts
      </h1>

      <div className="space-y-4">
        {attempts.map((attempt) => (
          <div key={attempt.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {attempt.question_set?.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(attempt.completed_at).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${attempt.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                  {attempt.score}%
                </div>
                {attempt.integrity_score && (
                  <div className={`text-sm mt-1 ${
                    attempt.integrity_score >= 80 ? 'text-green-600' : 
                    attempt.integrity_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Integrity: {attempt.integrity_score}%
                  </div>
                )}
              </div>
            </div>

            {attempt.suspicious_events && attempt.suspicious_events.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <p className="font-semibold text-red-800 dark:text-red-300 mb-2">
                  ⚠️ Suspicious Activity Detected
                </p>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                  {attempt.suspicious_events.map((event, idx) => (
                    <li key={idx}>
                      • {event.type.replace('_', ' ')}: {event.time}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDetail;
