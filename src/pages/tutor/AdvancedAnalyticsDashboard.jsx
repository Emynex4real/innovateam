import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  BarChart2, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  BookOpen, 
  Award,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const AdvancedAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await tutorialCenterService.getAdvancedAnalytics(timeRange);
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mb-4"></div>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gathering insights...</p>
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch(level) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
      default: return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/tutor')}
              className={`flex items-center gap-2 text-sm font-medium mb-2 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BarChart2 className="text-green-500" /> Analytics Overview
            </h1>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-1.5 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <Calendar size={16} className="text-gray-400 ml-2" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer pr-8 ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            label="Total Students" 
            value={analytics?.totalStudents || 0} 
            icon={Users} 
            trend="Active Learners"
            color="blue"
            isDarkMode={isDarkMode}
          />
          <StatCard 
            label="Test Attempts" 
            value={analytics?.totalAttempts || 0} 
            icon={FileText} 
            trend="Total Submissions"
            color="green"
            isDarkMode={isDarkMode}
          />
          <StatCard 
            label="Average Score" 
            value={`${analytics?.avgScore?.toFixed(1) || 0}%`} 
            icon={TrendingUp} 
            trend="Center Performance"
            color="emerald"
            isDarkMode={isDarkMode}
          />
          <StatCard 
            label="At-Risk Students" 
            value={analytics?.atRiskStudents || 0} 
            icon={AlertTriangle} 
            trend="Needs Attention"
            color="red"
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column (Left - 2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Performance Trend Chart */}
            {analytics?.performanceTrend && (
              <div className={`rounded-xl border shadow-sm p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-500" /> Performance Trend
                  </h2>
                </div>
                
                <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pt-4 border-b border-l border-gray-200 dark:border-gray-800 pl-4 pb-2">
                  {analytics.performanceTrend.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                        {day.avgScore}% on {day.date}
                      </div>
                      
                      {/* Bar */}
                      <div 
                        className="w-full max-w-[40px] bg-green-500/80 hover:bg-green-500 rounded-t-sm transition-all relative group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ height: `${(day.avgScore / 100) * 100}%` }}
                      ></div>
                      
                      {/* X-Axis Label */}
                      <div className={`text-[10px] mt-2 truncate w-full text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {day.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Performance */}
            {analytics?.topicPerformance && analytics.topicPerformance.length > 0 && (
              <div className={`rounded-xl border shadow-sm p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <BookOpen size={18} className="text-emerald-500" /> Topic Proficiency
                </h2>
                <div className="space-y-5">
                  {analytics.topicPerformance.map((topic, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">{topic.subject}</span>
                        <span className={`font-bold ${topic.avgScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                          {topic.avgScore}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            topic.avgScore >= 70 ? 'bg-emerald-500' : topic.avgScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${topic.avgScore}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{topic.attempts} attempts</span>
                        <span className="text-xs text-gray-500">{topic.students} students</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column (Right - 1/3 width) */}
          <div className="space-y-8">
            
            {/* At-Risk Students */}
            <div className={`rounded-xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800 bg-red-900/10' : 'border-gray-100 bg-red-50'}`}>
                <h2 className="font-bold text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle size={18} /> At-Risk Students
                </h2>
              </div>
              
              {!analytics?.atRiskList || analytics.atRiskList.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No at-risk students detected. Great job! 🎉</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                  {analytics.atRiskList.map((student, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-sm">{student.name}</h3>
                          <p className="text-xs text-gray-500">Avg Score: {student.avgScore}%</p>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getRiskColor(student.riskLevel)}`}>
                          {student.riskLevel}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 italic">
                        "{student.recommendation}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Performers */}
            <div className={`rounded-xl border shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800 bg-yellow-900/10' : 'border-gray-100 bg-yellow-50'}`}>
                <h2 className="font-bold text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                  <Award size={18} /> Top Performers
                </h2>
              </div>
              
              <div className="p-4 space-y-4">
                {analytics?.topPerformers && analytics.topPerformers.map((student, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      idx === 0 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                      idx === 1 ? 'bg-gray-100 text-gray-600 border border-gray-200' : 
                      'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.attempts} tests taken</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600 dark:text-green-400">{student.avgScore}%</span>
                    </div>
                  </div>
                ))}
                
                {(!analytics?.topPerformers || analytics.topPerformers.length === 0) && (
                  <p className="text-center text-sm text-gray-500 py-4">No data available yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ label, value, icon: Icon, trend, color, isDarkMode }) => {
  const colors = {
    blue: isDarkMode ? 'text-blue-400 bg-blue-900/20' : 'text-blue-600 bg-blue-50',
    green: isDarkMode ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-50',
    emerald: isDarkMode ? 'text-emerald-400 bg-emerald-900/20' : 'text-emerald-600 bg-emerald-50',
    red: isDarkMode ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50',
  };

  return (
    <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>{trend}</span>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;