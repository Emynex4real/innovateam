import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import analyticsService from '../../../services/analyticsService';
import predictionService from '../../../services/predictionService';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import {
  ScoreTrendChart,
  TopicMasteryHeatmap,
  AtRiskIndicator,
  PerformancePrediction
} from '../../../components/analytics/AnalyticsCharts';

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
      console.log('🔍 [ANALYTICS DEBUG] Starting analytics load...');
      console.log('📊 [ANALYTICS DEBUG] centerId:', centerId);
      console.log('📊 [ANALYTICS DEBUG] selectedPeriod:', selectedPeriod);

      const [analyticsRes, subjectsRes, trendsRes, recsRes, riskRes, passRateRes] = await Promise.all([
        analyticsService.getStudentAnalytics(centerId),
        analyticsService.getSubjectAnalytics(centerId),
        analyticsService.getPerformanceTrends(centerId, selectedPeriod),
        analyticsService.getRecommendations(centerId),
        predictionService.calculateAtRiskScore('self', centerId),
        predictionService.predictPassRate('self', centerId)
      ]);

      console.log('✅ [ANALYTICS DEBUG] API Responses:');
      console.log('  - analyticsRes:', analyticsRes);
      console.log('  - subjectsRes:', subjectsRes);
      console.log('  - trendsRes:', trendsRes);
      console.log('  - recsRes:', recsRes);
      console.log('  - riskRes:', riskRes);
      console.log('  - passRateRes:', passRateRes);

      if (analyticsRes.success) {
        console.log('✅ [ANALYTICS DEBUG] Setting analytics:', analyticsRes.analytics);
        setAnalytics(analyticsRes.analytics || analyticsRes.data);
      } else {
        console.error('❌ [ANALYTICS DEBUG] Analytics failed:', analyticsRes);
      }
      
      if (subjectsRes.success) {
        console.log('✅ [ANALYTICS DEBUG] Setting subjects:', subjectsRes.subjects || subjectsRes.data);
        setSubjects(subjectsRes.subjects || subjectsRes.data || []);
      } else {
        console.error('❌ [ANALYTICS DEBUG] Subjects failed:', subjectsRes);
      }
      
      if (trendsRes.success) {
        console.log('✅ [ANALYTICS DEBUG] Setting trends:', trendsRes.trend?.scores || trendsRes.data);
        setTrends(trendsRes.trend?.scores || trendsRes.data || []);
      } else {
        console.error('❌ [ANALYTICS DEBUG] Trends failed:', trendsRes);
      }
      
      if (recsRes.success) {
        console.log('✅ [ANALYTICS DEBUG] Setting recommendations:', recsRes.recommendations || recsRes.data);
        setRecommendations(recsRes.recommendations || recsRes.data || []);
      } else {
        console.error('❌ [ANALYTICS DEBUG] Recommendations failed:', recsRes);
      }
      
      if (riskRes.success) {
        console.log('✅ [ANALYTICS DEBUG] Setting risk score:', riskRes.data);
        setAtRiskScore(riskRes.data?.riskScore || riskRes.at_risk_score || 0);
        setAtRiskLevel(riskRes.data?.riskLevel || riskRes.at_risk_level || 'low');
      } else {
        console.error('❌ [ANALYTICS DEBUG] Risk score failed:', riskRes);
      }
      
      if (passRateRes.success) {
        console.log('✅ [ANALYTICS DEBUG] Setting pass rate:', passRateRes.data);
        setPredictedPassRate(passRateRes.data?.passRate || passRateRes.predicted_pass_rate || 0);
      } else {
        console.error('❌ [ANALYTICS DEBUG] Pass rate failed:', passRateRes);
      }
    } catch (error) {
      console.error('❌ [ANALYTICS DEBUG] Load analytics error:', error);
      console.error('❌ [ANALYTICS DEBUG] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error('Failed to load analytics: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
      console.log('🏁 [ANALYTICS DEBUG] Analytics load complete');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Your Performance Analytics
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your progress and identify areas for improvement
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className={`px-4 py-2 rounded-lg transition ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            ← Back
          </button>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analytics?.average_score.toFixed(1)}%
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analytics?.total_attempts}
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tests Taken</p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analytics?.overall_accuracy.toFixed(0)}%
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Accuracy</p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {analytics?.current_streak} 🔥
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Current Streak</p>
          </div>
        </div>

        {/* At-Risk Score */}
        <AtRiskIndicator riskScore={atRiskScore} riskLevel={atRiskLevel} />

        {/* Score Trends and Prediction */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Score Trend
              </h2>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                className={`px-3 py-1 rounded text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'}`}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <ScoreTrendChart data={trends} days={selectedPeriod} />
          </div>

          <div>
            <PerformancePrediction predictedPassRate={predictedPassRate} confidence="High" />
          </div>
        </div>

        {/* Subject Mastery */}
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Subject Mastery Levels
          </h2>
          {subjects.length > 0 ? (
            <TopicMasteryHeatmap data={subjects} />
          ) : (
            <p className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No subject data available yet
            </p>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
              📚 Study Recommendations
            </h2>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {rec.priority === 'high' ? '🔴' : '🟡'}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {rec.subject}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {rec.message}
                      </p>
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Suggested study time: {rec.suggestedStudyHours} hours
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Study Consistency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Study Consistency
            </h3>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {analytics?.study_consistency.toFixed(0)}%
              </div>
              <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden mb-3`}>
                <div 
                  className="h-full bg-green-600 transition-all duration-500"
                  style={{ width: `${analytics?.study_consistency || 0}%` }}
                />
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Keep up your study routine!
              </p>
            </div>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Time Invested
            </h3>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {Math.round((analytics?.total_time_spent || 0) / 3600)}h
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total study time
              </p>
              <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Avg: {analytics?.average_time_per_question || 0} seconds per question
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
