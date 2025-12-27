import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { componentStyles } from '../../styles/designSystem';
import StudentActivityModal from '../../components/StudentActivityModal';

const EnterpriseTutorDashboard = () => {
  const navigate = useNavigate();
  const [center, setCenter] = useState(null);
  const [stats, setStats] = useState({ students: 0, tests: 0, questions: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleEdit = async () => {
    if (!editName.trim()) {
      toast.error('Center name cannot be empty');
      return;
    }
    try {
      const res = await tutorialCenterService.updateCenter({ name: editName.trim(), description: center.description });
      if (res.success) {
        toast.success('Center updated!');
        setCenter(res.center);
        setShowEditModal(false);
      }
    } catch (error) {
      toast.error('Failed to update center');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await tutorialCenterService.deleteCenter({ reason: deleteReason || 'No reason provided' });
      if (res.success) {
        toast.success('Center deleted');
        setShowDeleteModal(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      toast.error('Failed to delete center');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [centerRes, studentsRes, testsRes] = await Promise.all([
        tutorialCenterService.getMyCenter(),
        tutorialCenterService.getStudents(),
        tutorialCenterService.getQuestionSets()
      ]);

      if (centerRes.success) setCenter(centerRes.center);
      if (studentsRes.success) {
        const students = studentsRes.students;
        const avgScore = students.length 
          ? Math.round(students.reduce((sum, s) => sum + (s.average_score || 0), 0) / students.length)
          : 0;
        setStats(prev => ({ ...prev, students: students.length, avgScore }));
      }
      if (testsRes.success) setStats(prev => ({ ...prev, tests: testsRes.questionSets.length }));
      
      // Load recent activity
      try {
        const attemptsRes = await tutorialCenterService.getCenterAttempts();
        if (attemptsRes.success && attemptsRes.attempts) {
          // Get student names
          const studentsRes = await tutorialCenterService.getStudents();
          const studentMap = {};
          if (studentsRes.success) {
            studentsRes.students.forEach(s => {
              studentMap[s.id] = s.name;
            });
          }

          const recent = attemptsRes.attempts.slice(0, 5).map(attempt => ({
            id: attempt.id,
            studentId: attempt.student_id,
            studentName: studentMap[attempt.student_id] || 'Student',
            testTitle: attempt.test_title || 'Test',
            score: attempt.score,
            passed: attempt.score >= (attempt.passing_score || 50),
            completedAt: attempt.completed_at
          }));
          setRecentActivity(recent);
        }
      } catch (err) {
        console.error('Failed to load activity:', err);
      }
      
      // Load questions separately to avoid blocking dashboard
      try {
        const questionsRes = await tutorialCenterService.getQuestions({ limit: 1000 });
        if (questionsRes.success) {
          setStats(prev => ({ ...prev, questions: questionsRes.questions.length }));
        }
      } catch (err) {
        console.error('Failed to load questions:', err);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
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

  if (!center) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={componentStyles.card.default + ' text-center max-w-md py-12'}
        >
          <div className="text-6xl mb-4">🏫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Center</h2>
          <p className="text-gray-600 mb-6">Set up your tutorial center to start teaching</p>
          <button
            onClick={() => navigate('/tutor/create-center')}
            className={componentStyles.button.primary}
          >
            Create Tutorial Center
          </button>
        </motion.div>
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
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tutor Dashboard 👨🏫</h1>
          <p className="text-gray-600">{center.name}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={componentStyles.card.default}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.students}</p>
                <p className="text-xs text-green-600 mt-1">+3 this week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                👥
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
                <p className="text-sm font-medium text-gray-600">Tests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tests}</p>
                <p className="text-xs text-gray-500 mt-1">Active tests</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                📝
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
                <p className="text-sm font-medium text-gray-600">Questions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.questions}</p>
                <p className="text-xs text-gray-500 mt-1">In question bank</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                ❓
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={componentStyles.card.default}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgScore}%</p>
                <p className="text-xs text-green-600 mt-1">+5% from last week</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={componentStyles.card.default}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/tutor/questions')}
                  className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                >
                  <div className="text-3xl mb-2">❓</div>
                  <div className="font-semibold text-gray-900">Questions</div>
                  <div className="text-sm text-gray-600">Manage question bank</div>
                </button>
                <button
                  onClick={() => navigate('/tutor/tests/create')}
                  className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                >
                  <div className="text-3xl mb-2">📝</div>
                  <div className="font-semibold text-gray-900">Create Test</div>
                  <div className="text-sm text-gray-600">Build new assessment</div>
                </button>
                <button
                  onClick={() => navigate('/tutor/students')}
                  className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                >
                  <div className="text-3xl mb-2">👥</div>
                  <div className="font-semibold text-gray-900">Students</div>
                  <div className="text-sm text-gray-600">View all students</div>
                </button>
                <button
                  onClick={() => navigate('/tutor/analytics')}
                  className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                >
                  <div className="text-3xl mb-2">📊</div>
                  <div className="font-semibold text-gray-900">Analytics</div>
                  <div className="text-sm text-gray-600">View insights</div>
                </button>
                <button
                  onClick={() => navigate('/tutor/analytics/comparative')}
                  className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                >
                  <div className="text-3xl mb-2">📈</div>
                  <div className="font-semibold text-gray-900">Compare Students</div>
                  <div className="text-sm text-gray-600">Comparative analytics</div>
                </button>
                <button
                  onClick={() => navigate('/tutor/students/alerts/all')}
                  className="p-6 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                >
                  <div className="text-3xl mb-2">🚨</div>
                  <div className="font-semibold text-gray-900">Student Alerts</div>
                  <div className="text-sm text-gray-600">View inactive students</div>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Center Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className={componentStyles.card.default}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Center Info</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditName(center.name);
                      setShowEditModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                    title="Edit center name"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-600 hover:text-red-700 text-sm"
                    title="Delete center"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{center.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Access Code</p>
                  <p className="text-lg font-mono font-bold text-green-600">{center.access_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm text-gray-900">{new Date(center.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/tutor/theme')}
                className={componentStyles.button.secondary + ' w-full mt-4'}
              >
                Customize Theme
              </button>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-6 text-white"
            >
              <div className="text-3xl mb-3">💡</div>
              <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
              <p className="text-sm text-green-100">
                Use AI to generate questions quickly and save time creating assessments!
              </p>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className={componentStyles.card.default}
            >
              <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      onClick={() => setSelectedActivity(activity)}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.passed ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {activity.passed ? '✓' : '○'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {activity.studentName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {activity.testTitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-semibold ${
                            activity.passed ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {activity.score}%
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(activity.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={componentStyles.card.default + ' max-w-md w-full'}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Center Name</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={componentStyles.input.default}
              placeholder="Enter center name"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className={componentStyles.button.secondary + ' flex-1'}
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className={componentStyles.button.primary + ' flex-1'}
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={componentStyles.card.default + ' max-w-md w-full'}
          >
            <h3 className="text-xl font-bold text-red-600 mb-4">Delete Tutorial Center</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete your tutorial center? This action cannot be undone.
            </p>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className={componentStyles.input.default}
              placeholder="Reason for deletion (optional)"
              rows={3}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={componentStyles.button.secondary + ' flex-1'}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Student Activity Modal */}
      {selectedActivity && (
        <StudentActivityModal 
          activity={selectedActivity} 
          onClose={() => setSelectedActivity(null)} 
        />
      )}
    </div>
  );
};

export default EnterpriseTutorDashboard;
