import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const TutorLeaderboard = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [leaderboard, setLeaderboard] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [testId]);

  const loadData = async () => {
    try {
      const [leaderboardRes, testRes] = await Promise.all([
        tutorialCenterService.getLeaderboard(testId),
        tutorialCenterService.getQuestionSet(testId)
      ]);
      
      if (leaderboardRes.success) {
        setLeaderboard(leaderboardRes.leaderboard);
      }
      if (testRes.success) {
        setTestInfo(testRes.questionSet);
      }
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`flex justify-center p-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className={`text-xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{testInfo?.title} - Leaderboard</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 text-sm`}>First attempts only</p>
          </div>
          <button
            onClick={() => navigate('/tutor/tests')}
            className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition text-sm`}
          >
            ← Back to Tests
          </button>
        </div>

        {leaderboard.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-8 md:p-12 text-center`}>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-500'}>No submissions yet</p>
          </div>
        ) : (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-x-auto`}>
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Rank</th>
                  <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Student</th>
                  <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Score</th>
                  <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Time</th>
                  <th className={`px-3 md:px-6 py-3 text-left text-xs font-medium uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Date</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className={`transition ${
                    entry.rank === 1 ? (isDarkMode ? 'bg-yellow-900/20 hover:bg-yellow-900/30' : 'bg-yellow-50 hover:bg-yellow-100') :
                    entry.rank === 2 ? (isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100') :
                    entry.rank === 3 ? (isDarkMode ? 'bg-orange-900/20 hover:bg-orange-900/30' : 'bg-orange-50 hover:bg-orange-100') :
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {entry.rank === 1 && <span className="text-xl md:text-2xl mr-1 md:mr-2">🥇</span>}
                        {entry.rank === 2 && <span className="text-xl md:text-2xl mr-1 md:mr-2">🥈</span>}
                        {entry.rank === 3 && <span className="text-xl md:text-2xl mr-1 md:mr-2">🥉</span>}
                        <span className={`font-bold text-base md:text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{entry.rank}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className={`font-medium text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{entry.student_name}</div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className={`font-bold text-base md:text-lg ${
                          entry.score >= testInfo?.passing_score ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {entry.score}%
                        </span>
                        <span className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({Math.round(entry.score * entry.total_questions / 100)}/{entry.total_questions})
                        </span>
                      </div>
                    </td>
                    <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {Math.floor(entry.time_taken / 60)}m {entry.time_taken % 60}s
                    </td>
                    <td className={`px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(entry.completed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorLeaderboard;
