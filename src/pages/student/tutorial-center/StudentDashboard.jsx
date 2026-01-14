import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Target, Zap, Clock, ChevronRight, 
  BookOpen, BarChart2, Globe, Plus, School, Users, Calendar, ArrowRight, GraduationCap
} from 'lucide-react';
import studentTCService from '../../../services/studentTC.service';
import StreakBadge from '../../../components/StreakBadge';
import LeagueCard from '../../../components/LeagueCard';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useTheme } from '../../../contexts/ThemeContext';

const EnterpriseDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const { primaryColor, logoUrl, centerName, updateBranding } = useTheme();
  const [centers, setCenters] = useState([]);
  const [stats, setStats] = useState({ tests: 0, avgScore: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  // --- 1. DATA LOADING (Preserved from your code) ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [centersRes, attemptsRes] = await Promise.all([
        studentTCService.getMyCenters(),
        studentTCService.getMyAttempts()
      ]);
      
      if (centersRes.success && centersRes.centers) {
        setCenters(centersRes.centers);
        
        // Update branding from first center
        if (centersRes.centers.length > 0) {
          const firstCenter = centersRes.centers[0];
          if (firstCenter.theme_config) {
            updateBranding({
              primaryColor: firstCenter.theme_config.primary_color || '#10b981',
              logoUrl: firstCenter.theme_config.logo_url || null,
              centerName: firstCenter.name
            });
          }
        }
      }
      if (attemptsRes.success) {
        const attempts = attemptsRes.attempts;
        setStats({
          tests: attempts.length,
          avgScore: attempts.length ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) : 0,
          streak: 0
        });
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
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const primaryCenter = centers[0];

  // --- 2. SUB-COMPONENTS (For cleaner UI) ---

  const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100'} p-5 rounded-3xl shadow-sm border flex items-center gap-4 transition-transform hover:scale-[1.02]`}
    >
      <div className={`p-3.5 rounded-2xl ${color} text-white shadow-lg`}>
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </motion.div>
  );

  const QuickAction = ({ icon: Icon, label, subtext, onClick, gradient, delay }) => (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={onClick}
      className={`relative overflow-hidden group p-6 rounded-3xl text-left transition-all duration-300 hover:shadow-xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-100'}`}
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 mb-4 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${gradient}`}>
          <Icon size={24} />
        </div>
        <h3 className={`font-bold text-lg mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtext}</p>
      </div>
    </motion.button>
  );

  // --- 3. MAIN RENDER ---

  return (
    <div className={`min-h-screen pb-20 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            {/* White-Label Branding */}
            {(logoUrl || centerName) && (
              <div className="flex items-center gap-4 mb-4">
                {logoUrl && (
                  <img 
                    src={logoUrl} 
                    alt={centerName || 'Tutorial Center'} 
                    className="h-16 w-auto object-contain"
                  />
                )}
                {/* {centerName && (
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: primaryColor || '#10b981' }}
                  >
                    {centerName}
                  </h2>
                )} */}
              </div>
            )}
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              Welcome Back!
            </h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
              Let's continue your learning streak.
            </p>
          </motion.div>
          
          {/* Streak Badge Component Integration */}
          {primaryCenter && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
               <StreakBadge centerId={primaryCenter.center_id || primaryCenter.id} />
            </motion.div>
          )}
        </div>

        {!primaryCenter ? (
          /* EMPTY STATE CTA */
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`rounded-[2.5rem] p-10 text-center relative overflow-hidden ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-2xl shadow-blue-900/5'}`}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <div className="mb-6 inline-flex p-6 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600">
              <School size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4">Start Your Journey</h2>
            <p className="text-lg opacity-70 mb-8 max-w-md mx-auto">
              Join a tutorial center to unlock premium tests, track your real-time progress, and compete on leaderboards.
            </p>
            <button
              onClick={() => navigate('/student/centers/join')}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
            >
              Join a Center Now
            </button>
          </motion.div>
        ) : (
          /* DASHBOARD CONTENT GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN (Main Stats & Actions) - Span 8 */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 1. High-Level Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  icon={BookOpen} 
                  label="Tests Taken" 
                  value={stats.tests} 
                  color="bg-blue-500" 
                  delay={0.1} 
                />
                <StatCard 
                  icon={Target} 
                  label="Avg. Score" 
                  value={`${stats.avgScore}%`} 
                  color="bg-emerald-500" 
                  delay={0.2} 
                />
                <StatCard 
                  icon={Trophy} 
                  label="Global Rank" 
                  value="#12" 
                  color="bg-purple-500" 
                  delay={0.3} 
                />
              </div>

              {/* 2. Primary Center Card - WITH BRANDING */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl"
                style={{
                  background: primaryColor 
                    ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` 
                    : 'linear-gradient(135deg, #2563eb, #1e40af)',
                  color: '#ffffff'
                }}
              >
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <School size={180} />
                </div>
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 text-white">
                    Active Center
                  </div>
                  
                  {/* Logo Display */}
                  {/* {logoUrl && (
                    <div className="mb-4 h-12 flex items-center">
                      <img 
                        src={logoUrl} 
                        alt={centerName || primaryCenter.center_name || primaryCenter.name} 
                        className="h-full object-contain brightness-0 invert"
                      />
                    </div>
                  )} */}
                  {logoUrl && (
                  <img 
                    src={logoUrl} 
                    alt={centerName || 'Tutorial Center'} 
                    className="h-16 w-auto object-contain"
                  />
                )}
                  
                  <h2 className="text-3xl font-bold text-white mb-2">{primaryCenter.center_name || primaryCenter.name}</h2>
                  <p className="text-white/80 mb-6 flex items-center gap-2">
                    <span className="font-mono bg-white/10 px-2 py-1 rounded">CODE: {primaryCenter.access_code}</span>
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/student/tests?center=${primaryCenter.center_id || primaryCenter.id}`)}
                      className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2"
                    >
                      <Clock size={18} /> Take New Test
                    </button>
                    <button
                      onClick={() => navigate(`/student/analytics/${primaryCenter.center_id || primaryCenter.id}`)}
                      className="px-6 py-3 bg-black/20 text-white rounded-xl font-bold hover:bg-black/30 transition-colors backdrop-blur-sm flex items-center gap-2"
                    >
                      <BarChart2 size={18} /> Analytics
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* 3. All Enrolled Centers */}
              {centers.length > 1 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>All My Centers</h3>
                    <button
                      onClick={() => navigate('/student/centers/join')}
                      className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Plus size={16} /> Join Another
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {centers.slice(1).map((center, idx) => (
                      <motion.div
                        key={center.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        onClick={() => navigate(`/student/tests?center=${center.center_id || center.id}`)}
                        className={`group p-6 rounded-2xl cursor-pointer transition-all hover:shadow-lg ${isDarkMode ? 'bg-gray-800/50 border border-gray-700 hover:border-blue-500' : 'bg-white border border-gray-100 hover:border-blue-500'}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                            <GraduationCap size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-bold mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{center.center_name || center.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <Calendar size={12} />
                              <span>Joined {new Date(center.enrolled_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-semibold group-hover:gap-2 transition-all">
                              View Tests <ArrowRight size={14} className="ml-1" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Quick Actions */}
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Explore More</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <QuickAction 
                    icon={Globe} 
                    label="Public Tests" 
                    subtext="Access free community tests" 
                    onClick={() => navigate('/student/tests/public')}
                    gradient="from-purple-500 to-pink-500"
                    delay={0.7}
                  />
                  <QuickAction 
                    icon={Plus} 
                    label="Join New Center" 
                    subtext="Enroll in more tutorial centers" 
                    onClick={() => navigate('/student/centers/join')}
                    gradient="from-orange-500 to-red-500"
                    delay={0.8}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (Sidebar) - Span 4 */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Leaderboard Widget */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 }}
                className={`${isDarkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white shadow-lg shadow-gray-200/50'} rounded-3xl p-6`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Leaderboard</h3>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">LIVE</span>
                </div>
                <LeagueCard centerId={primaryCenter.center_id || primaryCenter.id} />
              </motion.div>

              {/* Pro Tip Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}
                className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
              >
                <div className="absolute -bottom-4 -right-4 text-emerald-600 opacity-20">
                  <Zap size={100} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Zap size={20} />
                    </div>
                    <h3 className="font-bold">Pro Tip</h3>
                  </div>
                  <p className="text-emerald-50 text-sm leading-relaxed">
                    Students who take at least one test daily are 40% more likely to score an A in their finals. Keep going!
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseDashboard;