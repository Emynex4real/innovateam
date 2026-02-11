import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Users, Filter, ChevronRight, 
  TrendingUp, Award, AlertCircle, MoreVertical, 
  Mail, Calendar, ArrowUpRight, Link, X, Copy, ArrowLeft,
  GraduationCap, Check, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Students = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  // --- STATE ---
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'top', 'risk'
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [copied, setCopied] = useState(false);

  // --- INITIALIZATION ---
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const [studentsRes, centerRes] = await Promise.all([
        tutorialCenterService.getStudents(),
        tutorialCenterService.getMyCenter()
      ]);
      if (studentsRes.success) setStudents(studentsRes.students);
      if (centerRes.success) setAccessCode(centerRes.center.access_code);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(accessCode);
    setCopied(true);
    toast.success('Access code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/student/centers/join?code=${accessCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied!');
  };

  const handleEmailInvite = () => {
    const subject = 'Join My Tutorial Center';
    const body = `Hi! I'd like to invite you to join my tutorial center.\n\nAccess Code: ${accessCode}\n\nOr click this link: ${window.location.origin}/student/centers/join?code=${accessCode}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // --- COMPUTED DATA ---
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === 'top') return student.average_score >= 80;
    if (filter === 'risk') return student.average_score < 50;
    return true;
  });

  const classAverage = students.length 
    ? Math.round(students.reduce((acc, s) => acc + (s.average_score || 0), 0) / students.length) 
    : 0;

  const topPerformers = students.filter(s => s.average_score >= 80).length;

  // --- UI HELPER COMPONENTS ---
  
  const StatCard = ({ icon: Icon, label, value, subtext, colorClass, bgClass }) => (
    <div className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
          {subtext && <p className="text-xs font-medium text-emerald-500 flex items-center gap-1 mt-2"><TrendingUp size={12} /> {subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  const Avatar = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br from-green-500 to-green-600 text-white shadow-sm`}>
        {initials}
      </div>
    );
  };

  const ScoreBadge = ({ score }) => {
    if (!score && score !== 0) return <span className="text-gray-400">-</span>;
    let colorClass = 'bg-gray-100 text-gray-700 border-gray-200';
    if (score >= 80) colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
    else if (score >= 50) colorClass = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
    else colorClass = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';

    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${colorClass}`}>
        {score}% Avg
      </span>
    );
  };

  if (loading) return (
    <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 1. HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/tutor')}
              className={`flex items-center gap-2 text-sm font-medium mb-2 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage enrollment, track progress, and invite new students.
            </p>
          </div>
          <button 
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 transform active:scale-95"
            onClick={() => setShowInviteModal(true)}
          >
            <Share2 size={18} /> Invite Students
          </button>
        </div>

        {/* 2. STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={Users} 
            label="Total Enrollment" 
            value={students.length} 
            colorClass="text-blue-600 dark:text-blue-400"
            bgClass="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard 
            icon={Award} 
            label="Class Average" 
            value={`${classAverage}%`} 
            subtext="Performance metric"
            colorClass="text-green-600 dark:text-green-400"
            bgClass="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard 
            icon={GraduationCap} 
            label="Top Performers" 
            value={topPerformers} 
            subtext="Students > 80%"
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-emerald-50 dark:bg-emerald-900/20"
          />
        </div>

        {/* 3. FILTERS & SEARCH */}
        <div className={`p-2 rounded-xl border mb-6 flex flex-col md:flex-row gap-3 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-transparent outline-none ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
            />
          </div>
          
          <div className="flex p-1 gap-1 overflow-x-auto bg-gray-50 dark:bg-gray-800 rounded-lg">
            {[
              { id: 'all', label: 'All Students' },
              { id: 'top', label: 'Top Performers' },
              { id: 'risk', label: 'Needs Support' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.id 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. STUDENT LIST */}
        <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          
          {/* Table Header (Desktop) */}
          <div className={`hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'bg-gray-800/50 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
            <div className="col-span-5">Student Details</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2 text-center">Tests Taken</div>
            <div className="col-span-2 text-center">Performance</div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <AnimatePresence mode='popLayout'>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={student.id}
                    onClick={() => navigate(`/tutor/students/${student.id}/profile`)}
                    className={`group grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:px-6 md:py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer`}
                  >
                    {/* Name & Avatar */}
                    <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                      <Avatar name={student.name} />
                      <div>
                        <h3 className={`font-semibold text-sm md:text-base ${isDarkMode ? 'text-white' : 'text-gray-900 group-hover:text-green-600 transition-colors'}`}>
                          {student.name}
                        </h3>
                        <p className="text-xs text-gray-500 md:hidden">{student.email}</p>
                      </div>
                    </div>

                    {/* Contact (Desktop) */}
                    <div className="hidden md:flex col-span-3 items-center text-sm text-gray-500">
                      {student.email}
                    </div>

                    {/* Tests Taken */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="text-xs text-gray-400 font-medium uppercase md:hidden">Tests Taken</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {student.total_attempts || 0}
                      </span>
                    </div>

                    {/* Performance Score */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="text-xs text-gray-400 font-medium uppercase md:hidden">Avg Score</span>
                      <div className="flex items-center gap-2">
                        <ScoreBadge score={student.average_score} />
                        <ChevronRight size={16} className={`hidden md:block text-gray-400 group-hover:text-green-500 transition-transform group-hover:translate-x-1`} />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="p-12 text-center"
                >
                  <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
                    <Search size={32} />
                  </div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No students found</h3>
                  <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setFilter('all'); }}
                    className="mt-4 text-green-600 hover:underline text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 5. INVITE MODAL */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`max-w-md w-full rounded-2xl p-0 overflow-hidden ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'} shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 pb-0 flex items-center justify-between">
                <h2 className="text-xl font-bold">Invite Students</h2>
                <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <p className={`mb-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Students can join your center by entering this code or using the direct link below.
                </p>

                {/* Access Code Card */}
                <div className={`p-6 rounded-xl mb-6 text-center border-2 border-dashed ${isDarkMode ? 'bg-green-950/30 border-green-800' : 'bg-green-50 border-green-200'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 text-green-500">Center Access Code</p>
                  <div className="text-4xl font-mono font-bold tracking-widest mb-4">{accessCode}</div>
                  <button
                    onClick={handleCopyCode}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 mx-auto ${
                      copied 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : isDarkMode ? 'bg-white text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied to Clipboard' : 'Copy Code'}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                  <span className="text-xs text-gray-400 font-medium uppercase">Or share via</span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyLink}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                      <Link size={20} />
                    </div>
                    <span className="text-sm font-medium">Copy Link</span>
                  </button>

                  <button
                    onClick={handleEmailInvite}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                      <Mail size={20} />
                    </div>
                    <span className="text-sm font-medium">Send Email</span>
                  </button>
                </div>
              </div>
              
              <div className={`p-4 text-center text-xs border-t ${isDarkMode ? 'bg-gray-900 border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                Code expires only when you reset it in settings.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Students;