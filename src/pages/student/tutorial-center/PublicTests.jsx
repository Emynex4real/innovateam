import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Search, Clock, CheckCircle, BarChart2, 
  Play, School, Filter, BookOpen, ChevronRight 
} from 'lucide-react';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const PublicTests = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  // --- STATE ---
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- DATA FETCHING ---
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [publicRes, attemptsRes] = await Promise.all([
          studentTCService.getPublicTests(),
          studentTCService.getMyAttempts()
        ]);

        if (publicRes.success) setTests(publicRes.tests);
        
        if (attemptsRes.success) {
          const attemptsMap = {};
          attemptsRes.attempts.forEach(att => {
            if (!attemptsMap[att.question_set_id]) attemptsMap[att.question_set_id] = [];
            attemptsMap[att.question_set_id].push(att);
          });
          setAttempts(attemptsMap);
        }
      } catch (error) {
        toast.error('Failed to load public library');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // --- HELPERS ---
  const getTestInfo = (testId) => {
    const testAttempts = attempts[testId] || [];
    const bestScore = testAttempts.length ? Math.max(...testAttempts.map(a => a.score)) : 0;
    return {
      attempted: testAttempts.length > 0,
      bestScore,
      passed: bestScore >= (tests.find(t => t.id === testId)?.passing_score || 0)
    };
  };

  const filteredTests = tests.filter(test => {
    const info = getTestInfo(test.id);
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          test.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filter === 'new') return !info.attempted;
    if (filter === 'completed') return info.attempted;
    return true; // filter === 'all'
  });

  // --- RENDER ---
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4" />
        <p className="text-gray-500 font-medium">Accessing Public Library...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-20 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 1. HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                <Globe size={24} />
              </div>
              <h1 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Public Library
              </h1>
            </div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-lg`}>
              Open-access practice tests contributed by top educators. Master new subjects for free.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/student/centers')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <School size={18} />
            <span>My Centers</span>
          </motion.button>
        </div>

        {/* 2. SEARCH & FILTER BAR (Sticky) */}
        <div className={`sticky top-0 z-20 py-4 -mx-4 px-4 mb-6 backdrop-blur-md transition-colors border-b ${isDarkMode ? 'bg-gray-950/80 border-gray-800' : 'bg-gray-50/80 border-gray-200'}`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search topics, subjects, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none transition-all shadow-sm ${isDarkMode ? 'bg-gray-900 border border-gray-700 text-white focus:border-blue-500' : 'bg-white border border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
              />
            </div>

            {/* Filter Tabs */}
            <div className={`flex p-1.5 rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
              {[
                { id: 'all', label: 'All Tests' },
                { id: 'new', label: 'New' },
                { id: 'completed', label: 'Completed' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-sm font-bold transition-all ${filter === f.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. TEST GRID */}
        {filteredTests.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`text-center py-24 rounded-3xl border border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/30' : 'border-gray-300 bg-white'}`}
          >
            <div className="inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 text-gray-400">
              <Search size={32} />
            </div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No tests found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTests.map((test, i) => {
                const info = getTestInfo(test.id);
                return (
                  <motion.div
                    key={test.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/student/test/${test.id}`)}
                    className={`group relative rounded-[2rem] p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden border ${isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-blue-500/50' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl shadow-sm'}`}
                  >
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        info.attempted 
                          ? (info.passed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400')
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {info.attempted ? (
                          info.passed ? <><CheckCircle size={12} /> Passed {info.bestScore}%</> : <><BarChart2 size={12} /> {info.bestScore}%</>
                        ) : (
                          <><Globe size={12} /> Public</>
                        )}
                      </div>
                      
                      <div className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400 group-hover:bg-blue-900/30 group-hover:text-blue-400' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                        {info.attempted ? <Clock size={18} /> : <Play size={18} fill="currentColor" />}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className={`text-lg font-bold mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {test.title}
                      </h3>
                      <p className={`text-sm mb-6 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {test.description || "No description provided."}
                      </p>

                      {/* Meta Footer */}
                      <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                        <div className="flex gap-3 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1"><BookOpen size={14} /> {test.items?.[0]?.count || 0} Qs</span>
                          <span className="flex items-center gap-1"><Clock size={14} /> {test.time_limit}m</span>
                        </div>
                        <span className={`text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all ${info.attempted ? 'text-gray-500' : 'text-blue-600'}`}>
                          {info.attempted ? 'Retake' : 'Start'} <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 dark:from-blue-900/0 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* 4. FOOTER CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className={`mt-16 rounded-[2.5rem] relative overflow-hidden text-center p-10 md:p-14 ${isDarkMode ? 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-800/30' : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-900/20'}`}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 opacity-10 rotate-12"><Globe size={120} /></div>
            <div className="absolute bottom-10 right-10 opacity-10 -rotate-12"><School size={120} /></div>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className={`text-3xl md:text-4xl font-extrabold mb-4 ${isDarkMode ? 'text-white' : 'text-white'}`}>
              Want More Structured Learning?
            </h2>
            <p className={`text-lg mb-8 ${isDarkMode ? 'text-blue-100' : 'text-blue-100'}`}>
              Join a Tutorial Center to access exclusive curriculum, direct mentorship, and premium test series tailored for your success.
            </p>
            <button
              onClick={() => navigate('/student/centers/join')}
              className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:scale-105 flex items-center gap-2 mx-auto"
            >
              <School size={20} /> Join a Center
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default PublicTests;