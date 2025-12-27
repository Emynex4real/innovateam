import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const TutorDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [center, setCenter] = useState(null);
  const [stats, setStats] = useState({ students: 0, questions: 0, tests: 0, totalAttempts: 0, avgScore: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await tutorialCenterService.getMyCenter();
      if (response.success && response.center) {
        setCenter(response.center);
        setStats({
          students: response.center.student_count?.[0]?.count || 0,
          questions: response.center.question_count?.[0]?.count || 0,
          tests: response.center.test_count?.[0]?.count || 0,
          totalAttempts: response.analytics?.totalAttempts || 0,
          avgScore: response.analytics?.avgScore || 0
        });
        setAnalytics(response.analytics);
        setRecentActivity(response.recentActivity || []);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    try {
      const response = await tutorialCenterService.createCenter(formData);
      if (response.success) {
        toast.success('Tutorial center created!');
        setCenter(response.center);
        setShowCreateModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create center');
    }
  };

  const handleDeleteCenter = async () => {
    try {
      const response = await tutorialCenterService.deleteCenter({ reason: deleteReason });
      if (response.success) {
        toast.success('Tutorial center deleted successfully');
        setCenter(null);
        setShowDeleteModal(false);
        setDeleteReason('');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete center');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <div className="max-w-2xl mx-auto pt-20 p-8">
          <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white/80 backdrop-blur-xl shadow-2xl'} rounded-2xl p-8 text-center`}>
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎓</span>
              </div>
              <h2 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Welcome, Tutor!</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg`}>Create your tutorial center to start teaching</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg"
            >
              Create Tutorial Center
            </button>
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl p-8 max-w-md w-full shadow-2xl`}>
                <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Tutorial Center</h3>
                <form onSubmit={handleCreateCenter}>
                  <div className="mb-5">
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Center Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="e.g., Ade's Tutorial Center"
                    />
                  </div>
                  <div className="mb-6">
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 transition ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      rows="3"
                      placeholder="Brief description of your center"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className={`flex-1 py-3 rounded-xl transition font-semibold ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'from-orange-600 to-orange-800',
      silver: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-cyan-400 to-blue-600',
      diamond: 'from-purple-400 to-pink-600'
    };
    return colors[tier] || colors.bronze;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Header Card */}
        <div className={`${isDarkMode ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-xl border border-gray-700' : 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl'} rounded-2xl p-6 md:p-8 text-white`}>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🎓</span>
                <h1 className="text-3xl md:text-4xl font-bold">{center.name}</h1>
              </div>
              <p className="text-blue-100 text-base md:text-lg mb-4">{center.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <span>{stats.students} Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  <span>{stats.tests} Tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  <span>{stats.totalAttempts} Attempts</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-xl border-2 border-white/30">
                <p className="text-xs uppercase tracking-wider mb-1 opacity-90">Access Code</p>
                <p className="text-3xl font-mono font-bold tracking-widest">{center.access_code}</p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-100 rounded-lg text-sm font-medium transition"
              >
                Delete Center
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-xl p-6 hover:scale-105 transition-transform`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">👥</span>
              <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>Total</span>
            </div>
            <p className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.students}</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Students Enrolled</p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-xl p-6 hover:scale-105 transition-transform`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">❓</span>
              <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600'}`}>Bank</span>
            </div>
            <p className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.questions}</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Questions Created</p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-xl p-6 hover:scale-105 transition-transform`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📝</span>
              <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'}`}>Active</span>
            </div>
            <p className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.tests}</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tests Available</p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-xl p-6 hover:scale-105 transition-transform`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📊</span>
              <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-600'}`}>Avg</span>
            </div>
            <p className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.avgScore.toFixed(1)}%</p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average Score</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <button
              onClick={() => navigate('/tutor/questions')}
              className={`group p-5 border-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'border-gray-700 hover:border-blue-500 hover:bg-blue-900/20' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">❓</div>
              <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Add Questions</p>
            </button>
            
            <button
              onClick={() => navigate('/tutor/questions/generate')}
              className={`group p-5 border-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'border-gray-700 hover:border-green-500 hover:bg-green-900/20' : 'border-gray-200 hover:border-green-500 hover:bg-green-50'}`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🤖</div>
              <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Generate</p>
            </button>
            
            <button
              onClick={() => navigate('/tutor/tests/create')}
              className={`group p-5 border-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'border-gray-700 hover:border-purple-500 hover:bg-purple-900/20' : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'}`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📝</div>
              <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Test</p>
            </button>
            
            <button
              onClick={() => navigate('/tutor/students')}
              className={`group p-5 border-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'border-gray-700 hover:border-orange-500 hover:bg-orange-900/20' : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50'}`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
              <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manage Students</p>
            </button>

            <button
              onClick={() => navigate('/tutor/analytics/advanced')}
              className={`group p-5 border-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'border-gray-700 hover:border-pink-500 hover:bg-pink-900/20' : 'border-gray-200 hover:border-pink-500 hover:bg-pink-50'}`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📊</div>
              <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analytics</p>
            </button>

            <button
              onClick={() => navigate('/tutor/students/alerts/all')}
              className={`group p-5 border-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'border-gray-700 hover:border-red-500 hover:bg-red-900/20' : 'border-gray-200 hover:border-red-500 hover:bg-red-50'}`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🚨</div>
              <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student Alerts</p>
            </button>

            <button
              onClick={() => navigate('/tutor/analytics/comparative')}
              className={`group p-5 border-2 rounded-xl transition-all hover:scale-105 ${isDarkMode ? 'border-gray-700 hover:border-cyan-500 hover:bg-cyan-900/20' : 'border-gray-200 hover:border-cyan-500 hover:bg-cyan-50'}`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📈</div>
              <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Compare Students</p>
            </button>
          </div>
        </div>

        {/* Analytics Preview */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Performers 🏆</h3>
              {analytics.topStudents?.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topStudents.slice(0, 5).map((student, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getTierColor(student.tier)} flex items-center justify-center text-white font-bold text-sm`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{student.xp} XP • Level {student.level}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${student.avgScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {student.avgScore}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No student data yet</p>
              )}
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/50 backdrop-blur-xl border border-gray-700' : 'bg-white shadow-lg'} rounded-2xl p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity 📈</h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="text-2xl">{activity.type === 'test' ? '📝' : '👤'}</div>
                      <div className="flex-1">
                        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activity.message}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No recent activity</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Center Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl p-8 max-w-md w-full shadow-2xl`}>
            <h3 className={`text-2xl font-bold mb-4 text-red-500`}>Delete Tutorial Center</h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete <strong>{center?.name}</strong>? This action will be recorded for audit purposes.
            </p>
            <div className="mb-6">
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Reason (Optional)</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 transition ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                rows="3"
                placeholder="Why are you deleting this center?"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCenter}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition font-semibold"
              >
                Delete
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteReason(''); }}
                className={`flex-1 py-3 rounded-xl transition font-semibold ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
