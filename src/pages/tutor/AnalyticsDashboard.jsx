import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorAnalyticsService from '../../services/tutorAnalyticsService';
import predictionService from '../../services/predictionService';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { StudentComparisonChart, PerformanceDistribution } from '../../components/analytics/AnalyticsCharts';

const TutorAnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const [centerAnalytics, setCenterAnalytics] = useState(null);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [questionAnalysis, setQuestionAnalysis] = useState(null);
  const [testAnalytics, setTestAnalytics] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const centerRes = await tutorAnalyticsService.getCenterAnalytics();
      const centerId = centerRes?.analytics?.center_id;

      if (centerId) {
        const [riskRes, questionsRes, testsRes, insightsRes] = await Promise.all([
          predictionService.getAtRiskStudents(centerId),
          tutorAnalyticsService.getQuestionAnalysis(centerId),
          tutorAnalyticsService.getTestAnalytics(centerId),
          tutorAnalyticsService.getTutorInsights(centerId)
        ]);

        if (riskRes.success) {
          setAtRiskStudents(riskRes.all || []);
        }
        if (questionsRes.success) {
          setQuestionAnalysis(questionsRes);
        }
        if (testsRes.success) {
          setTestAnalytics(testsRes.tests || []);
        }
        if (insightsRes.success) {
          setInsights(insightsRes.insights);
        }
      }

      if (centerRes.success) {
        setCenterAnalytics(centerRes);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading center analytics...</p>
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
              📈 Advanced Analytics & Insights
            </h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Monitor your center's performance and student progress
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className={`px-4 py-2 rounded-lg transition ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            ← Back
          </button>
        </div>

        {/* Health Score Card */}
        {insights && (
          <div className={`p-6 rounded-lg bg-gradient-to-r ${
            insights.healthStatus === 'excellent' ? 'from-green-600 to-green-800' :
            insights.healthStatus === 'good' ? 'from-blue-600 to-blue-800' :
            insights.healthStatus === 'fair' ? 'from-yellow-600 to-yellow-800' :
            insights.healthStatus === 'poor' ? 'from-orange-600 to-orange-800' :
            'from-red-600 to-red-800'
          } text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Center Health Score</h2>
                <p className="text-white/80">{insights.healthStatus.toUpperCase()}</p>
              </div>
              <div className="text-6xl font-bold">{insights.healthScore}</div>
            </div>
            {insights.alerts.length > 0 && (
              <div className="mt-4 space-y-2">
                {insights.alerts.map((alert, idx) => (
                  <p key={idx} className="text-sm">⚠️ {alert}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {centerAnalytics?.analytics?.total_students || 0}
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {centerAnalytics?.analytics?.average_student_score?.toFixed(1) || 0}%
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Student Score</p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {atRiskStudents.length}
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>At-Risk Students</p>
          </div>

          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {centerAnalytics?.analytics?.pass_rate?.toFixed(0) || 0}%
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pass Rate</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {['overview', 'at-risk', 'questions', 'tests'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
                activeTab === tab
                  ? isDarkMode ? 'border-blue-500 text-blue-500' : 'border-blue-600 text-blue-600'
                  : isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'at-risk' && '⚠️ At-Risk'}
              {tab === 'questions' && '❓ Questions'}
              {tab === 'tests' && '📝 Tests'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {centerAnalytics?.studentPerformance && centerAnalytics.studentPerformance.length > 0 && (
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Student Performance Comparison
                  </h2>
                  <StudentComparisonChart students={centerAnalytics.studentPerformance.slice(0, 10)} />
                </div>
              )}

              {insights && insights.recommendations.length > 0 && (
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    💡 Recommendations
                  </h2>
                  <ul className="space-y-2">
                    {insights.recommendations.map((rec, idx) => (
                      <li key={idx} className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* At-Risk Students Tab */}
          {activeTab === 'at-risk' && (
            <div className="space-y-4">
              {atRiskStudents.length === 0 ? (
                <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    No at-risk students detected
                  </p>
                </div>
              ) : (
                <>
                  {['critical', 'high', 'medium'].map(level => {
                    const students = atRiskStudents.filter(s => s.at_risk_level === level);
                    if (students.length === 0) return null;

                    return (
                      <div key={level}>
                        <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {level === 'critical' ? '🔴 Critical Risk' : level === 'high' ? '🟠 High Risk' : '🟡 Medium Risk'}
                        </h3>
                        <div className="space-y-3">
                          {students.map(student => (
                            <div 
                              key={student.student_id}
                              className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer hover:shadow-lg transition`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {student.studentName}
                                  </h4>
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {student.email}
                                  </p>
                                </div>
                                <span className="text-3xl font-bold">{student.at_risk_score}/100</span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                                <div>
                                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</p>
                                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {student.averageScore.toFixed(1)}%
                                  </p>
                                </div>
                                <div>
                                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Attempts</p>
                                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {student.totalAttempts}
                                  </p>
                                </div>
                                <div>
                                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pass Rate</p>
                                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {student.predicted_pass_rate}%
                                  </p>
                                </div>
                                <div>
                                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Active</p>
                                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    {student.lastActivity 
                                      ? new Date(student.lastActivity).toLocaleDateString() 
                                      : 'Never'}
                                  </p>
                                </div>
                              </div>

                              {student.recommended_action && (
                                <p className={`text-sm p-2 rounded ${isDarkMode ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                                  💡 {student.recommended_action}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {questionAnalysis?.problematic && questionAnalysis.problematic.length > 0 && (
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                  <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>
                    ❌ Problematic Questions (&lt; 40% accuracy)
                  </h3>
                  <div className="space-y-2">
                    {questionAnalysis.problematic.slice(0, 5).map((q, idx) => (
                      <div key={idx} className={`p-3 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {q.tc_questions?.question_text.substring(0, 100)}...
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Accuracy: {q.accuracy_rate?.toFixed(1)}% • Attempts: {q.total_attempts}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tests Tab */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              {testAnalytics.length === 0 ? (
                <div className={`p-8 text-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    No tests created yet
                  </p>
                </div>
              ) : (
                testAnalytics.map((test, idx) => (
                  <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {test.title}
                        </h4>
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Attempts: {test.totalAttempts} • Avg Score: {test.averageScore}%
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/tutor/leaderboard/${test.testId}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View Leaderboard
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorAnalyticsDashboard;
