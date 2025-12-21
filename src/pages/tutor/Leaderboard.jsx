import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const EnhancedLeaderboard = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('all'); // all, week, month
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [testId, filter]);

  const loadLeaderboard = async () => {
    try {
      const response = await tutorialCenterService.getLeaderboard(testId, filter);
      if (response.success) {
        setLeaderboard(response.leaderboard);
        setTestInfo(response.testInfo);
      }
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    const tiers = {
      bronze: { 
        color: 'from-orange-600 to-orange-800', 
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        textColor: 'text-orange-700 dark:text-orange-300',
        icon: '🥉', 
        name: 'Bronze',
        minXP: 0
      },
      silver: { 
        color: 'from-gray-400 to-gray-600', 
        bgColor: 'bg-gray-100 dark:bg-gray-700/30',
        textColor: 'text-gray-700 dark:text-gray-300',
        icon: '🥈', 
        name: 'Silver',
        minXP: 500
      },
      gold: { 
        color: 'from-yellow-400 to-yellow-600', 
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        icon: '🥇', 
        name: 'Gold',
        minXP: 1000
      },
      platinum: { 
        color: 'from-cyan-400 to-blue-600', 
        bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
        textColor: 'text-cyan-700 dark:text-cyan-300',
        icon: '💎', 
        name: 'Platinum',
        minXP: 2500
      },
      diamond: { 
        color: 'from-purple-400 to-pink-600', 
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        textColor: 'text-purple-700 dark:text-purple-300',
        icon: '💠', 
        name: 'Diamond',
        minXP: 5000
      }
    };
    return tiers[tier] || tiers.bronze;
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return { emoji: '🥇', color: 'text-yellow-500' };
    if (rank === 2) return { emoji: '🥈', color: 'text-gray-400' };
    if (rank === 3) return { emoji: '🥉', color: 'text-orange-600' };
    return { emoji: `#${rank}`, color: isDarkMode ? 'text-gray-400' : 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl border border-gray-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl'} rounded-2xl p-6 md:p-8 text-white`}>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-white/80 hover:text-white transition flex items-center gap-2"
          >
            ← Back
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🏆</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Leaderboard</h1>
              {testInfo && <p className="text-purple-100 text-lg">{testInfo.title}</p>}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'all' 
                  ? 'bg-white text-purple-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilter('month')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'month' 
                  ? 'bg-white text-purple-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === 'week' 
                  ? 'bg-white text-purple-600' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 2nd Place */}
            <div className="pt-12">
              <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-xl'} rounded-2xl p-6 text-center transform hover:scale-105 transition`}>
                <div className="text-5xl mb-3">🥈</div>
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${getTierInfo(leaderboard[1].tier).color} flex items-center justify-center text-2xl border-4 border-white/30`}>
                  {getTierInfo(leaderboard[1].tier).icon}
                </div>
                <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{leaderboard[1].studentName}</h3>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Level {leaderboard[1].level}</p>
                <div className="text-2xl font-bold text-gray-400 mb-1">{leaderboard[1].score}%</div>
                <div className={`text-xs ${getTierInfo(leaderboard[1].tier).textColor}`}>{leaderboard[1].xpPoints} XP</div>
              </div>
            </div>

            {/* 1st Place */}
            <div>
              <div className={`${isDarkMode ? 'bg-gradient-to-br from-yellow-900/50 to-orange-900/50 backdrop-blur-xl border-2 border-yellow-500/50' : 'bg-gradient-to-br from-yellow-100 to-orange-100 shadow-2xl border-2 border-yellow-400'} rounded-2xl p-6 text-center transform hover:scale-105 transition`}>
                <div className="text-6xl mb-3">👑</div>
                <div className={`w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br ${getTierInfo(leaderboard[0].tier).color} flex items-center justify-center text-3xl border-4 border-yellow-400 shadow-xl`}>
                  {getTierInfo(leaderboard[0].tier).icon}
                </div>
                <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{leaderboard[0].studentName}</h3>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Level {leaderboard[0].level}</p>
                <div className="text-3xl font-bold text-yellow-600 mb-1">{leaderboard[0].score}%</div>
                <div className={`text-sm font-semibold ${getTierInfo(leaderboard[0].tier).textColor}`}>{leaderboard[0].xpPoints} XP</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="pt-12">
              <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-xl'} rounded-2xl p-6 text-center transform hover:scale-105 transition`}>
                <div className="text-5xl mb-3">🥉</div>
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${getTierInfo(leaderboard[2].tier).color} flex items-center justify-center text-2xl border-4 border-white/30`}>
                  {getTierInfo(leaderboard[2].tier).icon}
                </div>
                <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{leaderboard[2].studentName}</h3>
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Level {leaderboard[2].level}</p>
                <div className="text-2xl font-bold text-orange-600 mb-1">{leaderboard[2].score}%</div>
                <div className={`text-xs ${getTierInfo(leaderboard[2].tier).textColor}`}>{leaderboard[2].xpPoints} XP</div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl overflow-hidden`}>
          <div className="p-6">
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All Rankings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Rank</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Student</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tier</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Level</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Score</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>XP</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Streak</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {leaderboard.map((student, index) => {
                  const rankDisplay = getRankDisplay(index + 1);
                  const tierInfo = getTierInfo(student.tier);
                  
                  return (
                    <tr 
                      key={student.studentId}
                      className={`${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'} transition ${
                        index < 3 ? (isDarkMode ? 'bg-gray-700/20' : 'bg-yellow-50/50') : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className={`text-2xl font-bold ${rankDisplay.color}`}>
                          {rankDisplay.emoji}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tierInfo.color} flex items-center justify-center text-lg`}>
                            {tierInfo.icon}
                          </div>
                          <div>
                            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.studentName}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tierInfo.bgColor} ${tierInfo.textColor}`}>
                          {tierInfo.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {student.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          student.score >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          student.score >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {student.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {student.xpPoints}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span>🔥</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            {student.currentStreak}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏆</div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>No rankings yet</p>
              <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-2`}>Be the first to take this test!</p>
            </div>
          )}
        </div>

        {/* Tier Legend */}
        <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tier System</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(getTierInfo()).map(([key, tier]) => (
              <div key={key} className={`p-4 rounded-xl text-center ${tier.bgColor}`}>
                <div className="text-3xl mb-2">{tier.icon}</div>
                <p className={`font-semibold mb-1 ${tier.textColor}`}>{tier.name}</p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tier.minXP}+ XP</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLeaderboard;
