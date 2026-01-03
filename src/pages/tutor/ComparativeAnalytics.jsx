import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const ComparativeAnalytics = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [students, setStudents] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [classAverage, setClassAverage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await tutorialCenterService.getStudents();
      if (res.success) {
        const studentsList = res.students;
        setStudents(studentsList);
        
        const avg = studentsList.length > 0
          ? Math.round(studentsList.reduce((sum, s) => sum + s.average_score, 0) / studentsList.length)
          : 0;
        setClassAverage(avg);

        // Get analytics for each student
        const analyticsPromises = studentsList.slice(0, 10).map(s => 
          tutorialCenterService.getStudentAnalytics(s.id).catch(() => ({ success: false }))
        );
        const analyticsResults = await Promise.all(analyticsPromises);
        setAnalytics(analyticsResults.filter(r => r.success).map(r => r.analytics).flat());
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const topPerformers = [...students].sort((a, b) => b.average_score - a.average_score).slice(0, 5);
  const mostActive = [...students].sort((a, b) => b.total_attempts - a.total_attempts).slice(0, 5);
  const needsAttention = students.filter(s => s.average_score < classAverage && s.total_attempts > 2);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Comparative Analytics</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Compare student performance</p>
          </div>
          <button onClick={() => navigate('/tutor')} className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
            ← Back
          </button>
        </div>

        {/* Class Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{students.length}</div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Class Average</div>
            <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{classAverage}%</div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Above Average</div>
            <div className={`text-3xl font-bold text-green-500`}>{students.filter(s => s.average_score >= classAverage).length}</div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Below Average</div>
            <div className={`text-3xl font-bold text-red-500`}>{students.filter(s => s.average_score < classAverage).length}</div>
          </div>
        </div>

        {/* Top Performers */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>🏆 Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.map((student, idx) => (
              <div 
                key={student.id}
                onClick={() => navigate(`/tutor/students/${student.id}`)}
                className={`flex items-center justify-between p-4 rounded cursor-pointer ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    idx === 0 ? 'bg-yellow-500 text-white' :
                    idx === 1 ? 'bg-gray-400 text-white' :
                    idx === 2 ? 'bg-orange-600 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{student.total_attempts} tests taken</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.average_score}%</div>
                  <div className={`text-xs ${student.average_score >= classAverage ? 'text-green-500' : 'text-red-500'}`}>
                    {student.average_score >= classAverage ? '+' : ''}{student.average_score - classAverage}% vs avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Active */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>📊 Most Active</h3>
            <div className="space-y-2">
              {mostActive.map(student => (
                <div 
                  key={student.id}
                  onClick={() => navigate(`/tutor/students/${student.id}`)}
                  className={`flex justify-between p-3 rounded cursor-pointer ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition`}
                >
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{student.name}</span>
                  <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{student.total_attempts} tests</span>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Attention */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>⚠️ Needs Attention</h3>
            <div className="space-y-2">
              {needsAttention.slice(0, 5).map(student => (
                <div 
                  key={student.id}
                  onClick={() => navigate(`/tutor/students/${student.id}`)}
                  className={`flex justify-between p-3 rounded cursor-pointer ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition`}
                >
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>{student.name}</span>
                  <span className="font-bold text-red-500">{student.average_score}%</span>
                </div>
              ))}
              {needsAttention.length === 0 && (
                <p className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>All students performing well! 🎉</p>
              )}
            </div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mt-6`}>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { range: '0-20%', count: students.filter(s => s.average_score < 20).length },
              { range: '20-40%', count: students.filter(s => s.average_score >= 20 && s.average_score < 40).length },
              { range: '40-60%', count: students.filter(s => s.average_score >= 40 && s.average_score < 60).length },
              { range: '60-80%', count: students.filter(s => s.average_score >= 60 && s.average_score < 80).length },
              { range: '80-100%', count: students.filter(s => s.average_score >= 80).length }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ComparativeAnalytics;
