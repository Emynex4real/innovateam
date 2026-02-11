import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Clock, 
  CheckCircle, 
  Play, 
  BarChart2, 
  Search, 
  ChevronRight, 
  BookOpen, 
  ArrowLeft, 
  Filter, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
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
    if (att.length === 0) return { label: 'Not Started', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: Play, type: 'new' };
    
    const best = Math.max(...att.map(a => a.score));
    const passed = tests.find(t => t.id === testId)?.passing_score <= best;
    
    return passed 
      ? { label: 'Passed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle, score: best, type: 'passed' }
      : { label: 'Retake', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', icon: RefreshCw, score: best, type: 'failed' };
  };

  const filtered = tests.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || (filter === 'new' && !attempts[t.id]) || (filter === 'done' && attempts[t.id]))
  );

  if(loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <button
              onClick={() => navigate('/student/dashboard')}
              className={`flex items-center gap-2 text-sm font-medium mb-4 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Available Assessments</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Select a test to begin or review your previous attempts.
            </p>
          </div>

          {/* Toolbar */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="Search assessments..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                  isDarkMode ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {/* Filter Tabs */}
            <div className={`flex p-1 rounded-xl w-full md:w-auto ${isDarkMode ? 'bg-gray-950 border border-gray-800' : 'bg-gray-100'}`}>
              {[
                { id: 'all', label: 'All Tests' },
                { id: 'new', label: 'To Do' },
                { id: 'done', label: 'Completed' }
              ].map(f => (
                <button 
                  key={f.id} 
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f.id 
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-gray-800 dark:text-indigo-400' 
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tests Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <AlertCircle size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold">No tests found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className={`group relative flex flex-col rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-800 hover:border-indigo-500/50' 
                        : 'bg-white border-gray-200 hover:border-indigo-200'
                    }`}
                  >
                    {/* Status Banner (Mobile/Top) */}
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${status.color}`}>
                          <StatusIcon size={14} /> {status.label}
                        </span>
                        {status.score !== undefined && (
                          <span className={`text-sm font-bold ${
                            status.score >= test.passing_score 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {status.score}%
                          </span>
                        )}
                      </div>

                      <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {test.title}
                      </h3>
                      <p className={`text-sm line-clamp-2 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {test.description || "No description provided."}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${isDarkMode ? 'border-gray-800 bg-gray-950 text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>
                          <Clock size={12} />
                          {test.time_limit}m
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${isDarkMode ? 'border-gray-800 bg-gray-950 text-gray-400' : 'border-gray-100 bg-gray-50 text-gray-500'}`}>
                          <BookOpen size={12} />
                          {test.items?.length || 0} Qs
                        </div>
                      </div>
                    </div>

                    {/* Card Footer / Progress */}
                    <div className={`px-5 py-4 border-t mt-auto flex items-center justify-between ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                      {status.score !== undefined ? (
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between text-xs mb-1 font-medium text-gray-500">
                            <span>Score</span>
                            <span>Pass: {test.passing_score}%</span>
                          </div>
                          <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <div 
                              className={`h-full rounded-full ${status.score >= test.passing_score ? 'bg-green-500' : 'bg-amber-500'}`} 
                              style={{ width: `${status.score}%` }} 
                            />
                          </div>
                        </div>
                      ) : (
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Ready to start?
                        </span>
                      )}
                      
                      <button className={`p-2 rounded-full transition-colors ${
                        status.type === 'new'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseTestList;