import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import studentTCService from '../../../services/studentTC.service';
import StreakBadge from '../../../components/StreakBadge';
import LeagueCard from '../../../components/LeagueCard';
import toast from 'react-hot-toast';
import { componentStyles } from '../../../styles/designSystem';

const EnterpriseDashboard = () => {
  const navigate = useNavigate();
  const [centers, setCenters] = useState([]);
  const [stats, setStats] = useState({ tests: 0, avgScore: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [centersRes, attemptsRes] = await Promise.all([
        studentTCService.getMyCenters(),
        studentTCService.getMyAttempts()
      ]);
      
      if (centersRes.success) setCenters(centersRes.centers);
      if (attemptsRes.success) {
        const attempts = attemptsRes.attempts;
        setStats({
          tests: attempts.length,
          avgScore: attempts.length ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0,
          streak: 0
        });
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  const primaryCenter = centers[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
          <p className="text-gray-600">Here's your learning progress</p>
        </motion.div>

        {!primaryCenter ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={componentStyles.card.default + ' text-center py-12'}
          >
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Started</h2>
            <p className="text-gray-600 mb-6">Join a tutorial center to begin your learning journey</p>
            <button
              onClick={() => navigate('/student/centers/join')}
              className={componentStyles.button.primary}
            >
              Join Tutorial Center
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={componentStyles.card.default}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tests Taken</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tests}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      📝
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={componentStyles.card.default}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Score</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgScore}%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                      🎯
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={componentStyles.card.default}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rank</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">#12</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                      🏆
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={componentStyles.card.default}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/student/tests')}
                    className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                  >
                    <div className="text-3xl mb-2">📝</div>
                    <div className="font-semibold text-gray-900">Take Test</div>
                    <div className="text-sm text-gray-600">Start practicing now</div>
                  </button>
                  <button
                    onClick={() => navigate(`/student/analytics/${primaryCenter.center_id}`)}
                    className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                  >
                    <div className="text-3xl mb-2">📊</div>
                    <div className="font-semibold text-gray-900">Analytics</div>
                    <div className="text-sm text-gray-600">View your progress</div>
                  </button>
                  <button
                    onClick={() => navigate('/student/tests/public')}
                    className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                  >
                    <div className="text-3xl mb-2">🌍</div>
                    <div className="font-semibold text-gray-900">Public Tests</div>
                    <div className="text-sm text-gray-600">Explore more tests</div>
                  </button>
                  <button
                    onClick={() => navigate('/student/centers')}
                    className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                  >
                    <div className="text-3xl mb-2">🏫</div>
                    <div className="font-semibold text-gray-900">My Centers</div>
                    <div className="text-sm text-gray-600">Manage enrollments</div>
                  </button>
                </div>
              </motion.div>

              {/* League Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <LeagueCard centerId={primaryCenter.center_id} />
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Streak Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <StreakBadge centerId={primaryCenter.center_id} />
              </motion.div>

              {/* Center Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className={componentStyles.card.default}
              >
                <h3 className="font-bold text-gray-900 mb-3">My Center</h3>
                <p className="text-lg font-semibold text-gray-900">{primaryCenter.center_name}</p>
                <p className="text-sm text-gray-600 mt-1">Code: {primaryCenter.access_code}</p>
              </motion.div>

              {/* Tips Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white"
              >
                <div className="text-3xl mb-3">💡</div>
                <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                <p className="text-sm text-green-100">
                  Take tests daily to maintain your streak and climb the leaderboard!
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
