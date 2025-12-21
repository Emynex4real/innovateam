import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [centers, setCenters] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [centersRes, analyticsRes, achievementsRes] = await Promise.all([
        studentTCService.getMyCenters(),
        studentTCService.getMyAnalytics(),
        studentTCService.getMyAchievements()
      ]);
      
      if (centersRes.success) setCenters(centersRes.centers);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (achievementsRes.success) setAchievements(achievementsRes.achievements);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    const tiers = {
      bronze: { color: 'from-orange-600 to-orange-800', icon: '🥉', name: 'Bronze' },
      silver: { color: 'from-gray-400 to-gray-600', icon: '🥈', name: 'Silver' },
      gold: { color: 'from-yellow-400 to-yellow-600', icon: '🥇', name: 'Gold' },
      platinum: { color: 'from-cyan-400 to-blue-600', icon: '💎', name: 'Platinum' },
      diamond: { color: 'from-purple-400 to-pink-600', icon: '💠', name: 'Diamond' }
    };
    return tiers[tier] || tiers.bronze;
  };

  const getXPForNextLevel = (level) => level * 100;
  const getCurrentLevelXP = (xp, level) => xp - ((level - 1) * 100);
  const getXPProgress = (xp, level) => {
    const currentXP = getCurrentLevelXP(xp, level);
    const neededXP = getXPForNextLevel(level);
    return (currentXP / neededXP) * 100;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading your progress...</p>
        </div>
      </div>
    );
  }

  const tierInfo = analytics ? getTierInfo(analytics.tier) : getTierInfo('bronze');

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Profile Header */}
        <div className={`${isDarkMode ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-xl border border-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl'} rounded-2xl p-6 md:p-8 text-white`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${tierInfo.color} flex items-center justify-center text-4xl border-4 border-white/30 shadow-xl`}>
              {tierInfo.icon}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">Welcome Back!</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-md`}>
                  {tierInfo.name} Tier
                </span>
              </div>
              
              {analytics && (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-3 text-sm">
                    <span>⚡ Level {analytics.level}</span>
                    <span>🔥 {analytics.currentStreak} Day Streak</span>
                    <span>🏆 {analytics.xpPoints} XP</span>
                  </div>
                  
                  <div className="max-w-md mx-auto md:mx-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Level {analytics.level}</span>
                      <span>{getCurrentLevelXP(analytics.xpPoints, analytics.level)} / {getXPForNextLevel(analytics.level)} XP</span>
                    </div>
                    <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500 rounded-full"
                        style={{ width: `${getXPProgress(analytics.xpPoints, analytics.level)}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/student/tests/public')}
                className="px-6 py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-xl transition font-semibold"
              >
                🌍 Public Tests
              </button>
              <button
                onClick={() => navigate('/student/centers/join')}
                className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl transition font-semibold"
              >
                + Join Center
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-xl p-5 text-center hover:scale-105 transition-transform`}>
              <div className="text-3xl mb-2">📝</div>
              <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.totalTestsTaken}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tests Taken</p>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-xl p-5 text-center hover:scale-105 transition-transform`}>
              <div className="text-3xl mb-2">📊</div>
              <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.avgScore.toFixed(1)}%</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg Score</p>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-xl p-5 text-center hover:scale-105 transition-transform`}>
              <div className="text-3xl mb-2">🔥</div>
              <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.longestStreak}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Best Streak</p>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-xl p-5 text-center hover:scale-105 transition-transform`}>
              <div className="text-3xl mb-2">✅</div>
              <p className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.totalCorrectAnswers}</p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Correct Answers</p>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Achievements 🏆</h2>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{achievements.length} Unlocked</span>
          </div>
          
          {achievements.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl text-center transition-all hover:scale-105 ${
                    isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200'
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <p className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{achievement.name}</p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{achievement.description}</p>
                  <div className={`mt-2 text-xs font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    +{achievement.xpReward} XP
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>No achievements yet</p>
              <button
                onClick={() => navigate('/student/tests')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold"
              >
                Start Your First Test
              </button>
            </div>
          )}
        </div>

        {/* My Centers */}
        <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Tutorial Centers 🎓</h2>
            <button
              onClick={() => navigate('/student/centers/join')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              + Join New
            </button>
          </div>

          {centers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {centers.map((center) => (
                <div
                  key={center.id}
                  className={`p-5 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${
                    isDarkMode ? 'bg-gray-700/50 border-gray-600 hover:border-blue-500' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 hover:border-blue-400'
                  }`}
                  onClick={() => navigate('/student/tests')}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">🎓</div>
                    <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>
                      Active
                    </span>
                  </div>
                  <h3 className={`font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{center.name}</h3>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{center.description}</p>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <p>👨‍🏫 {center.tutorName}</p>
                    <p>📅 Joined {new Date(center.enrolledAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎓</div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>You haven't joined any centers yet</p>
              <button
                onClick={() => navigate('/student/centers/join')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold"
              >
                Join Your First Center
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/student/tests')}
            className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg'}`}
          >
            <div className="text-4xl mb-2">📝</div>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Take Test</p>
          </button>

          <button
            onClick={() => navigate('/student/leaderboard')}
            className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-purple-500' : 'bg-white border-gray-200 hover:border-purple-500 hover:shadow-lg'}`}
          >
            <div className="text-4xl mb-2">🏆</div>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Leaderboard</p>
          </button>

          <button
            onClick={() => navigate('/student/analytics')}
            className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-green-500' : 'bg-white border-gray-200 hover:border-green-500 hover:shadow-lg'}`}
          >
            <div className="text-4xl mb-2">📊</div>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>My Progress</p>
          </button>

          <button
            onClick={() => navigate('/student/achievements')}
            className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 hover:border-yellow-500' : 'bg-white border-gray-200 hover:border-yellow-500 hover:shadow-lg'}`}
          >
            <div className="text-4xl mb-2">🎖️</div>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Achievements</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
