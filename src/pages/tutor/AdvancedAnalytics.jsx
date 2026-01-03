import React, { useState, useEffect } from 'react';
import axios from 'axios';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdvancedAnalytics = () => {
  const { isDarkMode } = useDarkMode();
  const [centerId, setCenterId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [questionAnalytics, setQuestionAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { Authorization: `Bearer ${session?.access_token}` };

      // Get center
      const { data: centerData } = await axios.get(`${API_BASE}/tutorial-centers/my-center`, { headers });
      const cId = centerData.center.id;
      setCenterId(cId);

      // Get analytics
      const [analyticsRes, questionsRes] = await Promise.all([
        axios.get(`${API_BASE}/analytics/center/${cId}`, { headers }),
        axios.get(`${API_BASE}/analytics/questions/${cId}`, { headers })
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setQuestionAnalytics(questionsRes.data.analytics);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await axios.get(`${API_BASE}/analytics/export/pdf/${centerId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const exportExcel = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await axios.get(`${API_BASE}/analytics/export/excel/${centerId}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel downloaded');
    } catch (error) {
      toast.error('Failed to export Excel');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Advanced Analytics
          </h1>
          <div className="flex gap-3">
            <button
              onClick={exportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              📄 Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📊 Export Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.totalStudents}</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.avgScore.toFixed(1)}%</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pass Rate</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{analytics.passRate.toFixed(1)}%</p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>At-Risk Students</p>
              <p className={`text-3xl font-bold text-red-600`}>{analytics.atRiskStudents}</p>
            </div>
          </div>
        )}

        {/* Top Performers */}
        {analytics && (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Top Performers 🏆
            </h2>
            <div className="space-y-3">
              {analytics.topPerformers.map((student, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                    idx === 0 ? 'from-yellow-400 to-yellow-600' :
                    idx === 1 ? 'from-gray-400 to-gray-600' :
                    idx === 2 ? 'from-orange-600 to-orange-800' :
                    'from-blue-500 to-purple-600'
                  } flex items-center justify-center text-white font-bold`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Level {student.level} • {student.tier}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {student.xp_points} XP • {student.avg_score.toFixed(1)}% avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Analytics */}
        {questionAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Most Difficult Questions
              </h2>
              <div className="space-y-3">
                {questionAnalytics.mostDifficult.map((q, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-red-50'}`}>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {q.question}...
                    </p>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{q.subject}</span>
                      <span className="text-red-600 font-bold">{q.successRate}% success</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-lg`}>
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Most Answered Questions
              </h2>
              <div className="space-y-3">
                {questionAnalytics.mostAnswered.map((q, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {q.question}...
                    </p>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{q.subject}</span>
                      <span className="text-blue-600 font-bold">{q.timesAnswered} attempts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
