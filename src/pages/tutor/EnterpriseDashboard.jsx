import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { componentStyles } from '../../styles/designSystem';

const EnterpriseTutorDashboard = () => {
  const navigate = useNavigate();
  const [center, setCenter] = useState(null);
  const [stats, setStats] = useState({ students: 0, tests: 0, questions: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

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
              <h3 className="font-bold text-gray-900 mb-3">Center Info</h3>
              <div className="space-y-2">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseTutorDashboard;
