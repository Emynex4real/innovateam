import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import analyticsService from '../../../services/analyticsService';
import predictionService from '../../../services/predictionService';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { ChevronLeft, BarChart3, Target, Clock, Award, Flame } from 'lucide-react';

// Import existing charts (Assuming these exist based on your original code)
import {
  ScoreTrendChart,
  TopicMasteryHeatmap,
  AtRiskIndicator,
  PerformancePrediction
} from '../../../components/analytics/AnalyticsCharts';

// Import our newly enhanced components
import {
  RecentTestHistory,
  StrengthsWeaknesses,
  StudyCalendarHeatmap
} from '../../../components/analytics/EnhancedAnalytics';

// --- Skeleton Loader Component ---
const AnalyticsSkeleton = () => {
  const { isDarkMode } = useDarkMode();
  const bgClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const pulseClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className={`h-10 w-64 rounded-lg ${pulseClass}`}></div>
        <div className={`h-10 w-24 rounded-lg ${pulseClass}`}></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-32 rounded-xl ${bgClass} p-6`}>
            <div className={`h-8 w-16 mb-4 rounded ${pulseClass}`}></div>
            <div className={`h-4 w-24 rounded ${pulseClass}`}></div>
          </div>
        ))}
      </div>
      <div className={`h-64 rounded-xl ${bgClass}`}></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`h-80 rounded-xl ${bgClass}`}></div>
        <div className={`h-80 rounded-xl ${bgClass}`}></div>
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
      // Keeping all original logs and logic
      console.log('🔍 [ANALYTICS DEBUG] Starting analytics load...');

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
      console.error('❌ [ANALYTICS DEBUG] Load analytics error:', error);
      toast.error('Failed to load analytics: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
      console.log('🏁 [ANALYTICS DEBUG] Analytics load complete');
    }
  };

  const MetricCard = ({ title, value, subtext, icon: Icon, colorClass, borderClass }) => (
    <div className={`p-6 rounded-xl border transition-transform hover:-translate-y-1 ${
      isDarkMode 
        ? `bg-gray-800 ${borderClass || 'border-gray-700'}` 
        : `bg-white ${borderClass || 'border-gray-200'} shadow-sm`
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
      </div>
      <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        {value}
      </div>
      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <AnalyticsSkeleton />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl md:text-3xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
               <BarChart3 className="w-8 h-8 text-blue-500" />
               Performance Analytics
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your progress and identify areas for improvement
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>

        {/* Key Metrics Row - Improved UI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Average Score" 
            value={`${analytics?.average_score.toFixed(1)}%`}
            icon={Target}
            colorClass="text-blue-500"
            borderClass={isDarkMode ? 'border-blue-900/30' : 'border-blue-100'}
          />
          <MetricCard 
            title="Tests Taken" 
            value={analytics?.total_attempts}
            icon={Clock}
            colorClass="text-green-500"
            borderClass={isDarkMode ? 'border-green-900/30' : 'border-green-100'}
          />
          <MetricCard 
            title="Accuracy" 
            value={`${analytics?.overall_accuracy.toFixed(0)}%`}
            icon={Award}
            colorClass="text-purple-500"
            borderClass={isDarkMode ? 'border-purple-900/30' : 'border-purple-100'}
          />
          <MetricCard 
            title="Current Streak" 
            value={`${analytics?.current_streak} days`}
            icon={Flame}
            colorClass="text-orange-500"
            borderClass={isDarkMode ? 'border-orange-900/30' : 'border-orange-100'}
          />
        </div>

        {/* At-Risk Score Indicator */}
        <AtRiskIndicator riskScore={atRiskScore} riskLevel={atRiskLevel} />

        {/* Main Content Grid */}
        <div className="space-y-6">
            {/* Score Trends Chart */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-6">
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Score Trends
                </h2>
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                    className={`px-3 py-1.5 rounded-lg text-sm border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    }`}
                >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
                </div>
                <ScoreTrendChart data={trends} days={selectedPeriod} />
            </div>

            {/* Performance Prediction & Recent History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformancePrediction predictedPassRate={predictedPassRate} confidence="High" />
                <RecentTestHistory attempts={analytics?.recentAttempts} />
            </div>

            {/* Subject Mastery Heatmap */}
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h2 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Subject Mastery
                </h2>
                {subjects.length > 0 ? (
                    <TopicMasteryHeatmap data={subjects} />
                ) : (
                    <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No subject data available yet
                    </p>
                )}
            </div>

            {/* 2x2 Grid: Study Consistency, Strengths, Focus Areas, Time Invested */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <StudyCalendarHeatmap attempts={analytics?.recentAttempts} />
                
                <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <Clock className="w-5 h-5 text-blue-500" /> Time Invested
                    </h3>
                    <div className="space-y-4">
                         <div>
                            <div className="text-3xl font-bold text-blue-600">
                                {Math.round((analytics?.total_time_spent || 0) / 3600)}h
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total study time</p>
                         </div>
                         <div className={`h-px ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                         <div>
                            <div className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                {analytics?.average_time_per_question || 0}s
                            </div>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Avg per question</p>
                         </div>
                    </div>
                </div>
                
                <StrengthsWeaknesses subjects={subjects} />
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
            <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-blue-900/10 border-blue-800/30' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
                <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                     Study Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">
                            {rec.priority === 'high' ? '🔴' : '🟡'}
                        </span>
                        <div>
                            <h4 className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {rec.subject}
                            </h4>
                            <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {rec.message}
                            </p>
                            <div className={`text-xs mt-3 inline-block px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                ⏱ Suggested: {rec.suggestedStudyHours}h
                            </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;