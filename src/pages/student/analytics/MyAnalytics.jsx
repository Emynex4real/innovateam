import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import analyticsService from '../../../services/analyticsService';
import predictionService from '../../../services/predictionService';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { 
  ChevronLeft, 
  BarChart3, 
  Target, 
  Clock, 
  Award, 
  Zap, 
  TrendingUp, 
  BookOpen, 
  Calendar,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

// Import existing charts
import {
  ScoreTrendChart,
  TopicMasteryHeatmap,
  AtRiskIndicator,
  PerformancePrediction
} from '../../../components/analytics/AnalyticsCharts';

// Import enhanced components
import {
  RecentTestHistory,
  StrengthsWeaknesses,
  StudyCalendarHeatmap
} from '../../../components/analytics/EnhancedAnalytics';

// --- Skeleton Loader ---
const AnalyticsSkeleton = () => {
  const { isDarkMode } = useDarkMode();
  const bgClass = isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const pulseClass = isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className={`h-8 w-48 rounded-lg ${pulseClass}`}></div>
        <div className={`h-10 w-32 rounded-lg ${pulseClass}`}></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-32 rounded-xl border ${bgClass} p-6`}>
            <div className={`h-10 w-10 mb-4 rounded-full ${pulseClass}`}></div>
            <div className={`h-6 w-24 rounded ${pulseClass}`}></div>
          </div>
        ))}
      </div>
      <div className={`h-80 rounded-xl border ${bgClass}`}></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`h-64 rounded-xl border ${bgClass} lg:col-span-1`}></div>
        <div className={`h-64 rounded-xl border ${bgClass} lg:col-span-2`}></div>
      </div>
    </div>
  );
};

const StudentAnalytics = () => {
  const navigate = useNavigate();
  const { centerId } = useParams();
  const { isDarkMode } = useDarkMode();

  const [analytics, setAnalytics] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [trends, setTrends] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [atRiskScore, setAtRiskScore] = useState(0);
  const [atRiskLevel, setAtRiskLevel] = useState('low');
  const [predictedPassRate, setPredictedPassRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [centerId, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, subjectsRes, trendsRes, recsRes, riskRes, passRateRes] = await Promise.all([
        analyticsService.getStudentAnalytics(centerId),
        analyticsService.getSubjectAnalytics(centerId),
        analyticsService.getPerformanceTrends(centerId, selectedPeriod),
        analyticsService.getRecommendations(centerId),
        predictionService.calculateAtRiskScore('self', centerId),
        predictionService.predictPassRate('self', centerId)
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.analytics || analyticsRes.data);
      if (subjectsRes.success) setSubjects(subjectsRes.subjects || subjectsRes.data || []);
      if (trendsRes.success) setTrends(trendsRes.trend?.scores || trendsRes.data || []);
      if (recsRes.success) setRecommendations(recsRes.recommendations || recsRes.data || []);
      
      if (riskRes.success) {
        setAtRiskScore(riskRes.at_risk_score || 0);
        setAtRiskLevel(riskRes.at_risk_level || 'low');
      }
      
      if (passRateRes.success) {
        setPredictedPassRate(passRateRes.predicted_pass_rate || 0);
      }
    } catch (error) {
      console.error('Analytics load error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }) => {
    const colorStyles = {
      blue: isDarkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600',
      green: isDarkMode ? 'bg-emerald-900/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
      purple: isDarkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-600',
      amber: isDarkMode ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-50 text-amber-600',
    };

    return (
      <div className={`p-6 rounded-xl border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
            <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
          </div>
          <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
            <Icon size={20} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-500">
            <TrendingUp size={12} /> {trend}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'} font-sans`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 text-sm font-medium mb-2 transition-colors ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ChevronLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                <BarChart3 size={24} />
              </div>
              Performance Analytics
            </h1>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <Calendar size={16} className="text-gray-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
              className={`bg-transparent text-sm font-medium outline-none border-none cursor-pointer ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Avg Score" 
            value={`${analytics?.average_score.toFixed(1)}%`} 
            icon={Target} 
            color="blue" 
          />
          <StatCard 
            title="Tests Taken" 
            value={analytics?.total_attempts} 
            icon={BookOpen} 
            color="purple" 
          />
          <StatCard 
            title="Accuracy" 
            value={`${analytics?.overall_accuracy.toFixed(0)}%`} 
            icon={Award} 
            color="green" 
          />
          <StatCard 
            title="Streak" 
            value={`${analytics?.current_streak} Day${analytics?.current_streak !== 1 ? 's' : ''}`} 
            icon={Zap} 
            color="amber" 
          />
        </div>

        {/* Risk Banner (Conditional) */}
        <div className="mb-8">
           <AtRiskIndicator riskScore={atRiskScore} riskLevel={atRiskLevel} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Chart Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Trend Chart */}
            <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Performance Trend</h3>
              </div>
              <ScoreTrendChart data={trends} days={selectedPeriod} />
            </div>

            {/* Subject Mastery */}
            <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-6">Subject Proficiency</h3>
              {subjects.length > 0 ? (
                <TopicMasteryHeatmap data={subjects} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <BarChart3 size={32} className="mb-2 opacity-50" />
                  <p>Not enough data to calculate mastery yet.</p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="text-yellow-500" size={20} /> Suggested Focus
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border-l-4 flex flex-col gap-2 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    } ${
                      rec.priority === 'high' ? 'border-l-red-500' : 'border-l-yellow-500'
                    }`}>
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          rec.priority === 'high' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {rec.priority} Priority
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{rec.suggestedStudyHours}h study</span>
                      </div>
                      <h4 className="font-bold text-sm">{rec.subject}</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{rec.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column (1/3 width) */}
          <div className="space-y-8">
            
            {/* Prediction Card */}
            <PerformancePrediction predictedPassRate={predictedPassRate} confidence="High" />

            {/* Recent History */}
            <RecentTestHistory attempts={analytics?.recentAttempts} />

            {/* Time Stats */}
            <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="text-blue-500" size={18} /> Time Metrics
              </h3>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-sm text-gray-500">Total Study Time</p>
                  <p className="text-xl font-bold">{Math.round((analytics?.total_time_spent || 0) / 3600)}h</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Avg / Question</p>
                  <p className="text-xl font-bold">{analytics?.average_time_per_question || 0}s</p>
                </div>
              </div>
              
              <div className="mt-6">
                <StudyCalendarHeatmap attempts={analytics?.recentAttempts} />
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <StrengthsWeaknesses subjects={subjects} />

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;