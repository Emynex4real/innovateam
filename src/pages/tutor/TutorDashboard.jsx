import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  HelpCircle, 
  TrendingUp, 
  Settings, 
  AlertCircle,
  Plus,
  BarChart2,
  Trash2,
  Edit2,
  MoreVertical,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Layout
} from 'lucide-react';
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
        toast.success('Center created successfully!');
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
        toast.success('Center updated successfully!');
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
        toast.success('Center deleted successfully');
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
    
    if (!hasLoaded) {
      hasLoaded = true;
      loadData(isMounted, loadId);
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = async (isMounted = true, loadId = 'unknown') => {
    try {
      setLoading(true);
      const centerRes = await tutorialCenterService.getMyCenter();
      
      if (!isMounted) return;
      
      if (!centerRes.success || !centerRes.center) {
        setCenter(null);
        setLoading(false);
        return;
      }
      
      setCenter(centerRes.center);
      setLoading(false);
      
      const loadWithDelay = async (fn, name, delay) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        if (!isMounted) return { success: false };
        try {
          return await fn();
        } catch (error) {
          console.error(`${name} failed:`, error.message);
          return { success: false };
        }
      };
      
      const [studentsRes, testsRes, attemptsRes, questionsRes] = await Promise.all([
        loadWithDelay(() => tutorialCenterService.getStudents(), 'students', 0),
        loadWithDelay(() => tutorialCenterService.getQuestionSets(), 'tests', 200),
        loadWithDelay(() => tutorialCenterService.getCenterAttempts(), 'attempts', 400),
        loadWithDelay(() => tutorialCenterService.getQuestions({ limit: 1000 }), 'questions', 600)
      ]);
      
      if (!isMounted) return;
      
      if (studentsRes.success) {
        const students = studentsRes.students;
        const avgScore = students.length 
          ? Math.round(students.reduce((sum, s) => sum + (s.average_score || 0), 0) / students.length)
          : 0;
        setStats(prev => ({ ...prev, students: students.length, avgScore }));
      }
      
      if (testsRes.success) {
        setStats(prev => ({ ...prev, tests: testsRes.questionSets.length }));
      }
      
      if (questionsRes.success) {
        setStats(prev => ({ ...prev, questions: questionsRes.questions.length }));
      }
      
      if (attemptsRes.success && attemptsRes.attempts && studentsRes.success) {
        const studentMap = {};
        studentsRes.students.forEach(s => { studentMap[s.id] = s.name; });
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
    } catch (error) {
      console.error('Dashboard load error:', error);
      setCenter(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
        <p className="text-gray-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap size={40} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome, Tutor!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Set up your professional tutorial center to start creating assessments and tracking students.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Create Tutorial Center
          </button>
        </motion.div>

        {/* Create Center Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Center</h3>
                  <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <XCircle size={24} />
                  </button>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Center Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={newCenterName}
                      onChange={(e) => setNewCenterName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white transition-all"
                      placeholder="e.g. Elite Math Academy"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description (Optional)</label>
                    <textarea
                      value={newCenterDescription}
                      onChange={(e) => setNewCenterDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white transition-all resize-none"
                      placeholder="Briefly describe your institution..."
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCenter}
                    disabled={isCreating}
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Center'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
             {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-xl bg-white p-2 shadow-sm border border-gray-100" />
             ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                    <GraduationCap size={32} />
                </div>
             )}
             <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{center.name}</h1>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm mt-1">
                    <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium text-xs">Verified Center</span>
                    • Code: <span className="font-mono font-bold">{center.access_code}</span>
                </p>
             </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button
                onClick={() => {
                    setEditName(center.name);
                    setShowEditModal(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm font-medium shadow-sm"
            >
                <Settings size={16} /> Settings
            </button>
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-md shadow-green-200 dark:shadow-none"
            >
                <Layout size={16} /> Main Dashboard
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
                { label: 'Total Students', value: stats.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: 'Active Tests', value: stats.tests, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'Question Bank', value: stats.questions, icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { label: 'Avg Performance', value: `${stats.avgScore}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Quick Actions (Main Content) */}
            <div className="lg:col-span-2 space-y-6">
                <div>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Zap size={20} className="text-amber-500" /> Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                            onClick={() => navigate('/tutor/tests/create')}
                            className="group p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 text-left relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform">
                                <Plus size={80} />
                            </div>
                            <div className="relative z-10">
                                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 backdrop-blur-sm">
                                    <Plus size={24} />
                                </div>
                                <h3 className="text-lg font-bold mb-1">Create New Test</h3>
                                <p className="text-green-100 text-sm">Build a new assessment</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => navigate('/tutor/questions')}
                            className="group p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-green-300 dark:hover:border-green-700 text-left"
                        >
                            <div className="bg-blue-50 dark:bg-blue-900/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                                <HelpCircle size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors">Question Bank</h3>
                            <p className="text-gray-500 text-sm">Manage your repository</p>
                        </button>

                        <button 
                            onClick={() => navigate('/tutor/tests')}
                            className="group p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-green-300 dark:hover:border-green-700 text-left"
                        >
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-1 group-hover:text-emerald-600 transition-colors">Manage Tests</h3>
                            <p className="text-gray-500 text-sm">View active assessments</p>
                        </button>

                        <button 
                            onClick={() => navigate('/tutor/students')}
                            className="group p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-emerald-300 dark:hover:border-emerald-700 text-left"
                        >
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
                                <Users size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-1 group-hover:text-emerald-600 transition-colors">Student Roster</h3>
                            <p className="text-gray-500 text-sm">Track performance</p>
                        </button>

                        <button 
                            onClick={() => navigate('/tutor/analytics')}
                            className="group p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-amber-300 dark:hover:border-amber-700 text-left"
                        >
                            <div className="bg-amber-50 dark:bg-amber-900/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-amber-600 dark:text-amber-400">
                                <BarChart2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-1 group-hover:text-amber-600 transition-colors">Analytics</h3>
                            <p className="text-gray-500 text-sm">Insights & Reports</p>
                        </button>

                        <button 
                            onClick={() => navigate('/tutor/students/alerts/all')}
                            className="group p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-red-300 dark:hover:border-red-700 text-left"
                        >
                            <div className="bg-red-50 dark:bg-red-900/20 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-red-600 dark:text-red-400">
                                <AlertCircle size={24} />
                            </div>
                            <h3 className="text-lg font-bold mb-1 group-hover:text-red-600 transition-colors">Alerts</h3>
                            <p className="text-gray-500 text-sm">Needs attention</p>
                        </button>
                    </div>
                </div>

                {/* Recent Activity List */}
                {recentActivity.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <Clock size={18} className="text-gray-400" /> Recent Submissions
                            </h3>
                            <button className="text-xs font-semibold text-green-600 hover:text-green-700 dark:text-green-400 uppercase tracking-wide">View All</button>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {recentActivity.map((activity) => (
                                <div 
                                    key={activity.id}
                                    onClick={() => setSelectedActivity(activity)}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex items-center gap-4"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        activity.passed ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {activity.passed ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{activity.studentName}</p>
                                        <p className="text-xs text-gray-500 truncate">{activity.testTitle}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${activity.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                            {activity.score}%
                                        </span>
                                        <p className="text-[10px] text-gray-400">
                                            {new Date(activity.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar (Center Info) */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Center Details</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Center Name</p>
                            <p className="font-semibold">{center.name}</p>
                        </div>
                        
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Access Code</p>
                            <div className="flex items-center gap-2">
                                <code className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg font-mono text-lg font-bold tracking-wide text-green-600 dark:text-green-400">
                                    {center.access_code}
                                </code>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Created On</p>
                            <p className="text-sm">{new Date(center.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
                         <button
                            onClick={() => {
                                setEditName(center.name);
                                setShowEditModal(true);
                            }}
                            className="w-full py-2 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm transition flex items-center justify-center gap-2"
                        >
                            <Edit2 size={14} /> Edit Details
                        </button>
                        <button
                            onClick={() => navigate('/tutor/theme')}
                            className="w-full py-2 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm transition flex items-center justify-center gap-2"
                        >
                             <Settings size={14} /> Customize Theme
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-900 to-teal-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap size={100} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 relative z-10">Pro Tip</h3>
                    <p className="text-green-100 text-sm relative z-10 leading-relaxed mb-4">
                        Save time by using our AI Question Generator. Create comprehensive tests in seconds!
                    </p>
                    <button 
                        onClick={() => navigate('/tutor/questions')}
                        className="relative z-10 text-xs font-bold bg-white text-emerald-900 px-4 py-2 rounded-lg hover:bg-emerald-50 transition"
                    >
                        Try AI Generator
                    </button>
                </div>
                
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-2 transition-colors px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                        <Trash2 size={16} /> Delete Center
                    </button>
                </div>
            </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full"
                    >
                        <h3 className="font-bold text-lg mb-4">Edit Center Name</h3>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowEditModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium">Cancel</button>
                            <button onClick={handleEdit} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">Save</button>
                        </div>
                    </motion.div>
                </div>
            )}
             {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full"
                    >
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <AlertCircle size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Delete Center?</h3>
                        <p className="text-gray-500 text-sm mb-4">This action creates a permanent deletion request and cannot be undone immediately.</p>
                        <textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder="Reason for deletion (optional)"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                            rows={2}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Delete</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {selectedActivity && (
            <StudentActivityModal 
                activity={selectedActivity} 
                onClose={() => setSelectedActivity(null)} 
            />
        )}

        {/* Debug Panel */}
        <RequestDebugPanel />
      </div>
    </div>
  );
};

export default EnterpriseTutorDashboard;