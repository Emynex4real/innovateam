import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { componentStyles } from '../../styles/designSystem';
import StudentActivityModal from '../../components/StudentActivityModal';
import RequestDebugPanel from '../../components/RequestDebugPanel';
import { useTheme } from '../../contexts/ThemeContext';
import { isDebugEnabled } from '../../config/debug.config';

const EnterpriseTutorDashboard = () => {
  const navigate = useNavigate();
  const { logoUrl, centerName, primaryColor } = useTheme();
  const [center, setCenter] = useState(null);
  const [stats, setStats] = useState({ students: 0, tests: 0, questions: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterDescription, setNewCenterDescription] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCenter = async () => {
    if (!newCenterName.trim()) {
      toast.error('Center name is required');
      return;
    }
    if (isCreating) return;
    
    setIsCreating(true);
    
    // Add timeout
    const timeoutId = setTimeout(() => {
      toast.error('Request timeout - please try again');
      setIsCreating(false);
    }, 10000);
    
    try {
      const res = await tutorialCenterService.createCenter({ 
        name: newCenterName.trim(), 
        description: newCenterDescription.trim() 
      });
      
      clearTimeout(timeoutId);
      
      if (res.success) {
        toast.success('Center created!');
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error('Failed to create center');
        setIsCreating(false);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      const errorMsg = error.response?.data?.error || 'Failed to create center';
      
      if (errorMsg.includes('already have')) {
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(errorMsg);
        setIsCreating(false);
      }
    }
  };

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
    let isMounted = true;
    let hasLoaded = false;
    const loadId = Date.now();
    if (isDebugEnabled('DASHBOARD')) console.log(`🔄 [DASHBOARD-${loadId}] useEffect triggered`);
    
    // Prevent double execution in React Strict Mode
    if (!hasLoaded) {
      hasLoaded = true;
      loadData(isMounted, loadId);
    }
    
    return () => {
      if (isDebugEnabled('DASHBOARD')) console.log(`🛝 [DASHBOARD-${loadId}] Component unmounting`);
      isMounted = false;
    };
  }, []);

  const loadData = async (isMounted = true, loadId = 'unknown') => {
    if (isDebugEnabled('DASHBOARD')) console.log(`🚀 [DASHBOARD-${loadId}] loadData started`);
    
    try {
      setLoading(true);
      
      if (isDebugEnabled('DASHBOARD')) console.log(`🏛️ [DASHBOARD-${loadId}] Fetching center...`);
      const centerRes = await tutorialCenterService.getMyCenter();
      
      if (isDebugEnabled('DASHBOARD')) console.log(`✅ [DASHBOARD-${loadId}] Center response:`, centerRes);
      
      if (!isMounted) {
        if (isDebugEnabled('DASHBOARD')) console.log(`⚠️ [DASHBOARD-${loadId}] Component unmounted, aborting`);
        return;
      }
      
      if (!centerRes.success || !centerRes.center) {
        if (isDebugEnabled('DASHBOARD')) console.log(`❌ [DASHBOARD-${loadId}] No center found`);
        setCenter(null);
        setLoading(false);
        return;
      }
      
      setCenter(centerRes.center);
      setLoading(false);
      
      if (isDebugEnabled('DASHBOARD')) console.log(`📦 [DASHBOARD-${loadId}] Loading additional data (non-blocking)...`);
      
      // Sequential loading with delays to prevent stampede
      const loadWithDelay = async (fn, name, delay) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        if (!isMounted) return { success: false };
        if (isDebugEnabled('DASHBOARD')) console.log(`🔍 [DASHBOARD-${loadId}] Loading ${name}...`);
        try {
          const result = await fn();
          if (isDebugEnabled('DASHBOARD')) console.log(`✅ [DASHBOARD-${loadId}] ${name} loaded`);
          return result;
        } catch (error) {
          console.error(`❌ [DASHBOARD-${loadId}] ${name} failed:`, error.message);
          return { success: false };
        }
      };
      
      // Load data sequentially with 200ms delays
      const [studentsRes, testsRes, attemptsRes, questionsRes] = await Promise.all([
        loadWithDelay(() => tutorialCenterService.getStudents(), 'students', 0),
        loadWithDelay(() => tutorialCenterService.getQuestionSets(), 'tests', 200),
        loadWithDelay(() => tutorialCenterService.getCenterAttempts(), 'attempts', 400),
        loadWithDelay(() => tutorialCenterService.getQuestions({ limit: 1000 }), 'questions', 600)
      ]);
      
      if (!isMounted) {
        if (isDebugEnabled('DASHBOARD')) console.log(`⚠️ [DASHBOARD-${loadId}] Component unmounted during data load`);
        return;
      }
      
      if (isDebugEnabled('DASHBOARD')) console.log(`📊 [DASHBOARD-${loadId}] Processing stats...`);
      
      // Update stats
      if (studentsRes.success) {
        const students = studentsRes.students;
        const avgScore = students.length 
          ? Math.round(students.reduce((sum, s) => sum + (s.average_score || 0), 0) / students.length)
          : 0;
        setStats(prev => ({ ...prev, students: students.length, avgScore }));
        if (isDebugEnabled('DASHBOARD')) console.log(`👥 [DASHBOARD-${loadId}] Students: ${students.length}, Avg: ${avgScore}%`);
      }
      
      if (testsRes.success) {
        setStats(prev => ({ ...prev, tests: testsRes.questionSets.length }));
        if (isDebugEnabled('DASHBOARD')) console.log(`📝 [DASHBOARD-${loadId}] Tests: ${testsRes.questionSets.length}`);
      }
      
      if (questionsRes.success) {
        setStats(prev => ({ ...prev, questions: questionsRes.questions.length }));
        if (isDebugEnabled('DASHBOARD')) console.log(`❓ [DASHBOARD-${loadId}] Questions: ${questionsRes.questions.length}`);
      }
      
      // Update recent activity
      if (attemptsRes.success && attemptsRes.attempts && studentsRes.success) {
        const studentMap = {};
        studentsRes.students.forEach(s => { studentMap[s.id] = s.name; });
        const recent = attemptsRes.attempts.slice(0, 10).map(attempt => ({
          id: attempt.id,
          studentId: attempt.student_id,
          studentName: studentMap[attempt.student_id] || 'Student',
          testTitle: attempt.test_title || 'Test',
          score: attempt.score,
          passed: attempt.score >= (attempt.passing_score || 50),
          completedAt: attempt.completed_at
        }));
        setRecentActivity(recent);
        if (isDebugEnabled('DASHBOARD')) console.log(`📊 [DASHBOARD-${loadId}] Recent activity: ${recent.length} items`);
      }
      
      if (isDebugEnabled('DASHBOARD')) console.log(`✅ [DASHBOARD-${loadId}] loadData completed successfully`);
    } catch (error) {
      console.error(`❌ [DASHBOARD-${loadId}] Dashboard load error:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setCenter(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm text-center max-w-md py-12"
        >
          <div className="text-6xl mb-4">🏫</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Your Center</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Set up your tutorial center to start teaching</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Create Tutorial Center
          </button>
        </motion.div>

        {/* Create Center Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Tutorial Center</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Center Name *</label>
                  <input
                    type="text"
                    value={newCenterName}
                    onChange={(e) => setNewCenterName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Excellence Tutorial Center"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                  <textarea
                    value={newCenterDescription}
                    onChange={(e) => setNewCenterDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Brief description of your center"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCenter}
                  disabled={isCreating}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          
          {/* White-Label Branding */}
          <div className="flex items-center gap-6 mb-4">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={centerName || center?.name} 
                className="h-20 w-auto object-contain"
              />
            )}
            <div>
              <h1 
                className="text-4xl font-bold mb-2"
                style={{ color: primaryColor || '#10b981' }}
              >
                {centerName || center?.name || 'Tutorial Center'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Tutor Dashboard 👨🏫</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.students}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+3 this week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl">
                👥
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tests</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.tests}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active tests</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-2xl">
                📝
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.questions}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In question bank</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-2xl">
                ❓
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Score</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.avgScore}%</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+5% from last week</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity - Full Width */}
        {recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-0 border border-gray-100 dark:border-gray-700 shadow-sm mb-8 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{recentActivity.length} total</span>
                {recentActivity.length > 3 && (
                  <span className="text-xs text-gray-400">← Scroll →</span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="flex gap-0">
                {recentActivity.map((activity, idx) => (
                  <div 
                    key={activity.id} 
                    onClick={() => setSelectedActivity(activity)}
                    className={`flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer min-w-[280px] md:min-w-[33.333%] flex-shrink-0 ${
                      idx !== 0 ? 'border-l border-gray-100 dark:border-gray-700' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.passed ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    }`}>
                      {activity.passed ? '✓' : '○'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {activity.studentName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {activity.testTitle}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-lg font-bold ${
                        activity.passed ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                      }`}>
                        {activity.score}%
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(activity.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
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
                  onClick={() => navigate('/tutor/tests')}
                  className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                >
                  <div className="text-3xl mb-2">📝</div>
                  <div className="font-semibold text-gray-900">Manage Tests</div>
                  <div className="text-sm text-gray-600">View & edit tests</div>
                </button>
                <button
                  onClick={() => navigate('/tutor/tests/create')}
                  className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl text-left transition-all transform hover:scale-[1.02]"
                >
                  <div className="text-3xl mb-2">➕</div>
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
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-white">Center Info</h3>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{center.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Access Code</p>
                  <p className="text-lg font-mono font-bold text-green-600 dark:text-green-400">{center.access_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-gray-300">{new Date(center.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/tutor/theme')}
                className="w-full mt-4 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
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

      {/* Request Debug Panel (dev only) */}
      <RequestDebugPanel />
    </div>
  );
};

export default EnterpriseTutorDashboard;
