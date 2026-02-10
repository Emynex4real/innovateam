import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Calendar, MapPin, Phone, 
  TrendingUp, FileText, Download, Plus, Clock, 
  CheckCircle2, AlertCircle, XCircle, User, 
  MoreVertical, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, CartesianGrid, Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { generateStudentReportPDF } from '../../utils/pdfReportGenerator';

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('week');

  // --- DATA LOADING ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, history, stats, prog, studentNotes] = await Promise.all([
          tutorialCenterService.getStudentProfile(studentId),
          tutorialCenterService.getStudentTestHistory(studentId),
          tutorialCenterService.getStudentAnalytics(studentId),
          tutorialCenterService.getStudentProgress(studentId, 'month'),
          tutorialCenterService.getStudentNotes(studentId)
        ]);

        if (profile.success) setStudent(profile.student);
        if (history.success) setTestHistory(history.attempts);
        if (stats.success) setAnalytics(stats.analytics);
        if (prog.success) setProgress(prog.progress);
        if (studentNotes.success) setNotes(studentNotes.notes);
      } catch (error) {
        toast.error('Could not load student profile');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [studentId]);

  // --- HANDLERS ---
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await tutorialCenterService.addStudentNote(studentId, newNote);
      if (res.success) {
        setNotes([res.note, ...notes]);
        setNewNote('');
        toast.success('Note added');
      }
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleDownloadReport = async () => {
    const loadingToast = toast.loading('Generating PDF report...');
    try {
      const res = await tutorialCenterService.generateStudentReport(studentId, reportPeriod);
      if (res.success) {
        generateStudentReportPDF(res.report);
        toast.success('PDF report downloaded successfully!', { id: loadingToast });
      } else {
        toast.error(res.message || 'Failed to generate report', { id: loadingToast });
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast.error(error.message || 'Failed to generate report', { id: loadingToast });
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  if (!student) return null;

  const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const performanceColor = student.average_score >= 70 ? 'text-green-500' : student.average_score >= 50 ? 'text-yellow-500' : 'text-red-500';
  const performanceBg = student.average_score >= 70 ? 'bg-green-500' : student.average_score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'} font-sans`}>
      
      {/* 1. TOP NAVIGATION */}
      <div className={`sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between border-b backdrop-blur-md ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/tutor/students')}
            className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-tight">Student Profile</h1>
            <span className="text-xs text-gray-500">Manage performance & records</span>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className={`px-4 py-2 rounded-xl border font-medium transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="all">All Time</option>
          </select>
          <button className={`p-2 rounded-xl border transition-colors ${isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-400' : 'border-gray-200 hover:bg-gray-50 text-gray-600'}`}>
            <MoreVertical size={20} />
          </button>
          <button 
            onClick={handleDownloadReport}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Download size={18} /> Export PDF Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 2. SIDEBAR PROFILE CARD (Left Column) */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
            >
              {/* Background Gradient */}
              <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-600 to-purple-600 opacity-10`} />
              
              <div className="relative flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-1 mb-4 shadow-xl">
                  <div className={`w-full h-full rounded-[20px] flex items-center justify-center text-3xl font-bold text-white ${isDarkMode ? 'bg-gray-900' : 'bg-white text-blue-600'}`}>
                    {initials}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-1">{student.name}</h2>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${
                  student.tier === 'gold' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Shield size={12} fill="currentColor" /> {student.tier} Member
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-2 w-full mb-8">
                  <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 uppercase font-bold">Level</p>
                    <p className="text-xl font-black">{student.level}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 uppercase font-bold">XP</p>
                    <p className="text-xl font-black text-blue-500">{student.total_xp}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <p className="text-xs text-gray-500 uppercase font-bold">Tests</p>
                    <p className="text-xl font-black">{student.total_tests}</p>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="w-full space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-gray-500">
                    <Mail size={16} /> <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    <Calendar size={16} /> <span>Joined {new Date(student.enrolled_at).toLocaleDateString()}</span>
                  </div>
                  {/* Add more fields if available in student object */}
                </div>
              </div>
            </motion.div>

            {/* Performance Snapshot */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
            >
              <h3 className="font-bold mb-4">Performance Vitals</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Average Score</span>
                    <span className={`font-bold ${performanceColor}`}>{student.average_score}%</span>
                  </div>
                  <div className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div 
                      className={`h-full rounded-full ${performanceBg}`} 
                      style={{ width: `${student.average_score}%` }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Attendance</span>
                    <span className="font-bold text-blue-500">92%</span>
                  </div>
                  <div className={`h-2 w-full rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* 3. MAIN CONTENT AREA (Right Column) */}
          <div className="lg:col-span-8">
            
            {/* Tabs */}
            <div className={`flex gap-2 p-1 rounded-2xl mb-8 overflow-x-auto ${isDarkMode ? 'bg-gray-900/50' : 'bg-white border border-gray-100'}`}>
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'history', label: 'Test History', icon: Clock },
                { id: 'notes', label: 'Notes', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode='wait'>
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Main Chart */}
                  <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Progress Timeline</h3>
                      <select 
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value)}
                        className={`text-sm bg-transparent font-medium outline-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        <option value="month">Last 30 Days</option>
                        <option value="week">Last 7 Days</option>
                      </select>
                    </div>
                    <div className="h-[300px] w-full">
                      {progress.length > 0 ? (
                        <ResponsiveContainer>
                          <AreaChart data={progress}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1f2937' : '#f3f4f6'} />
                            <XAxis 
                              dataKey="completed_at" 
                              tickFormatter={(val) => new Date(val).getDate()}
                              axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} 
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} domain={[0, 100]} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} fill="url(#colorScore)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <TrendingUp size={48} className="mb-4 opacity-20" />
                          <p>No enough data for chart</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject Breakdown (Bar Chart) */}
                  <div className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                    <h3 className="font-bold text-lg mb-6">Subject Proficiency</h3>
                    <div className="h-[250px] w-full">
                      {analytics.length > 0 ? (
                        <ResponsiveContainer>
                          <BarChart data={analytics} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1f2937' : '#f3f4f6'} />
                            <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                            <Tooltip cursor={{ fill: isDarkMode ? '#1f2937' : '#f9fafb' }} contentStyle={{ borderRadius: '12px' }} />
                            <Bar dataKey="avgScore" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">No subject data</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- HISTORY TAB --- */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {testHistory.length === 0 ? (
                    <div className={`text-center py-20 rounded-3xl border border-dashed ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                      <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">No test history available</p>
                    </div>
                  ) : (
                    testHistory.map((test) => (
                      <div 
                        key={test.id} 
                        className={`group p-5 rounded-2xl border transition-all hover:shadow-md hover:border-blue-500 cursor-pointer flex items-center justify-between ${
                          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                            test.score >= 50 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                          }`}>
                            {test.score}
                          </div>
                          <div>
                            <h4 className={`font-bold text-lg group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {test.tc_question_sets?.title}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                              <span>{new Date(test.completed_at).toLocaleDateString()}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300" />
                              <span>{test.total_questions} Questions</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            test.score >= 50 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                          }`}>
                            {test.score >= 50 ? 'PASSED' : 'FAILED'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* --- NOTES TAB --- */}
              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                >
                  <div className={`p-6 rounded-3xl border mb-8 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18} /> New Note</h3>
                    <textarea 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a private observation or milestone..."
                      className={`w-full p-4 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] mb-4 transition-all ${
                        isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handleAddNote}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 ml-4">
                    {notes.map((note) => (
                      <div key={note.id} className="relative">
                        <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${isDarkMode ? 'bg-gray-900 border-blue-500' : 'bg-white border-blue-500'}`} />
                        <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                          <p className={`text-sm mb-3 font-mono text-gray-400`}>
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                          <p className="leading-relaxed whitespace-pre-wrap">{note.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Export FAB */}
      <button
        onClick={handleDownloadReport}
        className="md:hidden fixed bottom-20 right-6 z-40 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all active:scale-95"
      >
        <Download size={24} />
      </button>
    </div>
  );
};

export default StudentProfile;