import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Target, Zap, Clock, ChevronRight, 
  BookOpen, BarChart2, Globe, Plus, School, Users, Calendar, ArrowRight, GraduationCap, Layout
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

  // --- DATA LOADING ---
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
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-zinc-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-500 border-t-transparent" />
      </div>
    );
  }

  const primaryCenter = centers[0];

  // --- HELPER COMPONENTS ---

  const MetricCard = ({ label, value, icon: Icon, trend }) => (
    <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`p-2 rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
          <Icon size={18} />
        </span>
        {trend && (
          <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
        <div className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{label}</div>
      </div>
    </div>
  );

  const ActionButton = ({ icon: Icon, label, desc, onClick }) => (
    <button 
      onClick={onClick}
      className={`group w-full p-4 rounded-xl border text-left transition-all ${
        isDarkMode 
          ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600' 
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-zinc-950 text-zinc-300' : 'bg-gray-50 text-gray-700'} group-hover:scale-110 transition-transform`}>
          <Icon size={18} />
        </div>
        <span className={`font-semibold ${isDarkMode ? 'text-zinc-100' : 'text-gray-900'}`}>{label}</span>
      </div>
      <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{desc}</p>
    </button>
  );

  // --- MAIN RENDER ---

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'} font-sans`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              ) : (
                <Layout size={24} className={isDarkMode ? 'text-zinc-400' : 'text-gray-400'} />
              )}
              <h2 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                Student Portal
              </h2>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          </div>
          
          {primaryCenter && (
            <div className="flex items-center gap-4">
              <StreakBadge centerId={primaryCenter.center_id || primaryCenter.id} />
              <div className={`h-8 w-px ${isDarkMode ? 'bg-zinc-800' : 'bg-gray-200'}`} />
              <div className="text-right">
                <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Current Session</p>
                <p className="text-sm font-semibold">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          )}
        </div>

        {!primaryCenter ? (
          /* EMPTY STATE */
          <div className={`rounded-2xl border border-dashed p-12 text-center max-w-2xl mx-auto ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-300 bg-white'}`}>
            <div className={`inline-flex p-4 rounded-full mb-6 ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
              <School size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">No Active Enrollment</h3>
            <p className={`mb-8 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              Join a tutorial center to access tests, resources, and track your progress.
            </p>
            <button
              onClick={() => navigate('/student/centers/join')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Find a Center
            </button>
          </div>
        ) : (
          /* DASHBOARD GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Active Center Card (Hero) */}
              <div className={`relative overflow-hidden rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                {/* Colored Top Bar based on theme */}
                <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor || '#3b82f6' }} />
                
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide mb-3 ${isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-600'}`}>
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active Center
                      </div>
                      <h2 className="text-2xl font-bold mb-1">{primaryCenter.center_name || primaryCenter.name}</h2>
                      <p className={`font-mono text-sm ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>ID: {primaryCenter.access_code}</p>
                    </div>
                    {logoUrl && (
                      <img src={logoUrl} alt="Center Logo" className="w-16 h-16 object-contain rounded-lg bg-white p-1 border border-gray-100" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate(`/student/tests?center=${primaryCenter.center_id || primaryCenter.id}`)}
                      className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      <Zap size={18} /> Start New Test
                    </button>
                    <button
                      onClick={() => navigate(`/student/analytics/${primaryCenter.center_id || primaryCenter.id}`)}
                      className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold border transition-colors ${
                        isDarkMode 
                          ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-200' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <BarChart2 size={18} /> View Analytics
                    </button>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard 
                  label="Tests Completed" 
                  value={stats.tests} 
                  icon={BookOpen} 
                />
                <MetricCard 
                  label="Avg. Performance" 
                  value={`${stats.avgScore}%`} 
                  icon={Target}
                  trend={stats.avgScore > 70 ? "Good" : null}
                />
                <MetricCard 
                  label="Global Rank" 
                  value="#--" 
                  icon={Trophy} 
                />
              </div>

              {/* Other Centers List */}
              {centers.length > 1 && (
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Other Enrollments</h3>
                  <div className="space-y-3">
                    {centers.slice(1).map((center) => (
                      <div 
                        key={center.id}
                        onClick={() => navigate(`/student/tests?center=${center.center_id || center.id}`)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${
                          isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
                            <School size={20} />
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{center.center_name || center.name}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Joined {new Date(center.enrolled_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <ChevronRight size={16} className={isDarkMode ? 'text-zinc-600' : 'text-gray-400'} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Quick Actions */}
              <div>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Quick Actions</h3>
                <div className="grid gap-3">
                  <ActionButton 
                    icon={Globe} 
                    label="Public Tests" 
                    desc="Browse community content" 
                    onClick={() => navigate('/student/tests/public')} 
                  />
                  <ActionButton 
                    icon={Plus} 
                    label="Join Center" 
                    desc="Enroll with a new code" 
                    onClick={() => navigate('/student/centers/join')} 
                  />
                </div>
              </div>

              {/* Leaderboard Widget */}
              <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                <div className={`px-5 py-3 border-b flex justify-between items-center ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                  <h3 className="font-semibold text-sm">Leaderboard</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">LIVE</span>
                </div>
                <div className="p-2">
                  <LeagueCard centerId={primaryCenter.center_id || primaryCenter.id} compact={true} />
                </div>
              </div>

              {/* Tip Widget */}
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-indigo-950/30 border-indigo-900/50' : 'bg-indigo-50 border-indigo-100'}`}>
                <div className="flex gap-3">
                  <Zap size={20} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>Did you know?</h4>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>
                      Consistent practice is key. Students who take tests 3 times a week score 25% higher on average.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseDashboard;