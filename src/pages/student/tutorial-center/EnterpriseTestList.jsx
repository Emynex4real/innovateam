import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, CheckCircle, Play, BarChart2, Search, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const EnterpriseTestList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const centerId = searchParams.get('center');
  const { isDarkMode } = useDarkMode();
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const [tRes, aRes] = await Promise.all([
          studentTCService.getAvailableTests(centerId),
          studentTCService.getMyAttempts()
        ]);
        if (tRes.success) setTests(tRes.questionSets);
        if (aRes.success) {
          const map = {};
          aRes.attempts.forEach(a => {
            if (!map[a.question_set_id]) map[a.question_set_id] = [];
            map[a.question_set_id].push(a);
          });
          setAttempts(map);
        }
      } catch (e) { 
        toast.error("Error loading tests"); 
      } finally { 
        setLoading(false); 
      }
    };
    init();
  }, [centerId]);

  const getStatus = (testId) => {
    const att = attempts[testId] || [];
    if (att.length === 0) return { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Play };
    const best = Math.max(...att.map(a => a.score));
    const passed = tests.find(t => t.id === testId)?.passing_score <= best;
    return passed 
      ? { label: 'Passed', color: 'bg-green-100 text-green-700', icon: CheckCircle, score: best }
      : { label: 'Failed', color: 'bg-red-100 text-red-700', icon: BarChart2, score: best };
  };

  const filtered = tests.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || (filter === 'new' && !attempts[t.id]) || (filter === 'done' && attempts[t.id]))
  );

  if(loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header with Search */}
        <div className={`sticky top-0 z-10 pb-4 pt-2 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <button
            onClick={() => navigate('/student/dashboard')}
            className={`flex items-center gap-2 mb-4 transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
            <h1 className={`text-3xl font-bold self-start ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assignments</h1>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <div className={`flex rounded-xl p-1 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                {['all', 'new', 'done'].map(f => (
                  <button 
                    key={f} onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((test, i) => {
              const status = getStatus(test.id);
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/student/test/${test.id}`)}
                  className={`group rounded-2xl p-5 border cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center gap-4 ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500' : 'bg-white border-gray-100 hover:border-blue-500'}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 ${status.color}`}>
                        <StatusIcon size={12} /> {status.label} {status.score !== undefined && `• ${status.score}%`}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={12} /> {test.time_limit}m</span>
                        <span className="flex items-center gap-1"><BookOpen size={12} /> {test.items?.[0]?.count || 0} Qs</span>
                      </div>
                    </div>
                    <h3 className={`font-bold text-lg transition-colors group-hover:text-blue-600 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {test.title}
                    </h3>
                    <p className={`text-sm mt-1 line-clamp-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {test.description || "No description provided."}
                    </p>
                  </div>

                  <div className={`flex items-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    {/* Mini Progress Bar if attempted */}
                    {status.score !== undefined && (
                      <div className="hidden md:block w-32">
                        <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className={`h-full ${status.score >= test.passing_score ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${status.score}%` }} />
                        </div>
                      </div>
                    )}
                    
                    <button className={`w-full md:w-auto px-6 py-2.5 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${isDarkMode ? 'bg-gray-700 text-white group-hover:bg-blue-600' : 'bg-gray-50 text-gray-900 group-hover:bg-blue-600 group-hover:text-white'}`}>
                      {status.label === 'New' ? 'Start' : 'Retake'} <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseTestList;