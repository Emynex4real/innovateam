import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Users, Filter, ChevronRight, 
  TrendingUp, Award, AlertCircle, MoreVertical, 
  Mail, Calendar, ArrowUpRight, Link, X, Copy, ArrowLeft
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

  // --- UI COMPONENTS ---
  
  const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} flex items-start gap-4`}>
      <div className={`p-3 rounded-xl ${color} ${isDarkMode ? 'bg-opacity-20' : 'bg-opacity-10'}`}>
        <Icon size={22} className={isDarkMode ? 'text-white' : ''} />
      </div>
      <div>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
        {subtext && <p className="text-xs text-green-500 flex items-center gap-1 mt-1"><TrendingUp size={12} /> {subtext}</p>}
      </div>
    </div>
  );

  const Avatar = ({ name }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md`}>
        {initials}
      </div>
    );
  };

  const ScoreBadge = ({ score }) => {
    let colorClass = 'bg-gray-100 text-gray-700';
    if (score >= 70) colorClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    else if (score >= 50) colorClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    else colorClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colorClass}`}>
        {score}% Avg
      </span>
    );
  };

  if (loading) return (
    <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'} font-sans pb-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        
        {/* 1. HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate('/tutor')}
              className={`flex items-center gap-2 mb-4 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Classroom</h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your students and track their progress.
            </p>
          </div>
          <button 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            onClick={() => setShowInviteModal(true)}
          >
            <Users size={18} /> Invite Students
          </button>
        </div>

        {/* 2. CLASS VITALS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard 
            icon={Users} 
            label="Total Students" 
            value={students.length} 
            color="bg-blue-100 text-blue-600" 
          />
          <StatCard 
            icon={Award} 
            label="Class Average" 
            value={`${classAverage}%`} 
            subtext="+5% this week"
            color="bg-purple-100 text-purple-600" 
          />
          <StatCard 
            icon={AlertCircle} 
            label="Top Performers" 
            value={topPerformers} 
            color="bg-green-100 text-green-600" 
          />
        </div>

        {/* 3. TOOLBAR */}
        <div className={`p-2 rounded-2xl border mb-6 flex flex-col md:flex-row gap-4 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`flex-1 flex items-center px-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Search size={20} className="text-gray-400 mr-3" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 bg-transparent outline-none"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Students' },
              { id: 'top', label: 'Top Performers' },
              { id: 'risk', label: 'Needs Attention' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  filter === f.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : isDarkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. STUDENT LIST (Responsive Table/Cards) */}
        <div className={`rounded-3xl border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          
          {/* Desktop Headers */}
          <div className={`hidden md:grid grid-cols-12 gap-4 p-4 border-b text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'bg-gray-800/50 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
            <div className="col-span-4 pl-2">Student</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2 text-center">Activity</div>
            <div className="col-span-2 text-center">Performance</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <AnimatePresence>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={student.id}
                    onClick={() => navigate(`/tutor/students/${student.id}/profile`)}
                    className={`group grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer`}
                  >
                    {/* Name & Avatar */}
                    <div className="col-span-1 md:col-span-4 flex items-center gap-4 pl-2">
                      <Avatar name={student.name} />
                      <div>
                        <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</h3>
                        <p className="text-xs text-gray-500 md:hidden">{student.email}</p>
                      </div>
                    </div>

                    {/* Contact (Desktop) */}
                    <div className="hidden md:flex col-span-3 items-center text-sm text-gray-500">
                      <Mail size={14} className="mr-2" /> {student.email}
                    </div>

                    {/* Stats */}
                    <div className="col-span-1 md:col-span-2 flex md:justify-center items-center gap-6 md:gap-0 mt-2 md:mt-0">
                      <div className="flex flex-col md:items-center">
                        <span className="text-xs text-gray-400 font-medium uppercase md:hidden mb-1">Tests</span>
                        <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {student.total_attempts || 0}
                        </span>
                      </div>
                      
                      {/* Mobile Only Avg Score display */}
                      <div className="md:hidden flex flex-col">
                        <span className="text-xs text-gray-400 font-medium uppercase mb-1">Avg Score</span>
                        <ScoreBadge score={student.average_score} />
                      </div>
                    </div>

                    {/* Performance Badge (Desktop) */}
                    <div className="hidden md:flex col-span-2 justify-center">
                      <ScoreBadge score={student.average_score} />
                    </div>

                    {/* Action Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 md:static md:col-span-1 flex justify-end">
                      <div className={`p-2 rounded-full transition-all ${isDarkMode ? 'group-hover:bg-gray-700 text-gray-600 group-hover:text-white' : 'group-hover:bg-gray-100 text-gray-300 group-hover:text-blue-600'}`}>
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
                    <Search size={32} />
                  </div>
                  <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No students found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-md w-full rounded-3xl p-8 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'} shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Invite Students</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Share your access code or invite link with students to join your center.
            </p>

            {/* Access Code Display */}
            <div className={`p-6 rounded-2xl mb-6 text-center ${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-800' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'}`}>
              <p className="text-sm font-medium mb-2 opacity-75">Access Code</p>
              <div className="text-4xl font-bold tracking-[0.5em] mb-4">{accessCode}</div>
              <button
                onClick={handleCopyCode}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto ${copied ? 'bg-green-600 text-white' : 'bg-white/20 hover:bg-white/30'}`}
              >
                {copied ? <><Copy size={16} /> Copied!</> : <><Copy size={16} /> Copy Code</>}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <button
                onClick={handleCopyLink}
                className={`w-full p-4 rounded-xl border-2 font-semibold flex items-center justify-between transition-all ${isDarkMode ? 'border-gray-800 hover:border-blue-600 hover:bg-gray-800' : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <Link size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Copy Invite Link</div>
                    <div className="text-xs opacity-60">Share via messaging apps</div>
                  </div>
                </div>
                <ChevronRight size={20} className="opacity-50" />
              </button>

              <button
                onClick={handleEmailInvite}
                className={`w-full p-4 rounded-xl border-2 font-semibold flex items-center justify-between transition-all ${isDarkMode ? 'border-gray-800 hover:border-purple-600 hover:bg-gray-800' : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                    <Mail size={20} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Send Email Invite</div>
                    <div className="text-xs opacity-60">Open email client</div>
                  </div>
                </div>
                <ChevronRight size={20} className="opacity-50" />
              </button>
            </div>

            <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <p className="text-xs text-gray-500">
                💡 <strong>Tip:</strong> Students can join by entering the code at the "Join Center" page or clicking the invite link.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Students;