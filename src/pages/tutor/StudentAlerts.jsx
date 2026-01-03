import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { AlertTriangle, TrendingDown, Clock, Award } from 'lucide-react';

const StudentAlerts = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [alerts, setAlerts] = useState({ inactive_students: [], low_performers: [], high_achievers: [] });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [alertsRes, studentsRes] = await Promise.all([
        tutorialCenterService.getStudentAlerts(),
        tutorialCenterService.getStudents()
      ]);

      if (alertsRes.success) setAlerts(alertsRes.alerts);
      if (studentsRes.success) {
        const studentsList = studentsRes.students;
        setStudents(studentsList);
        
        // Calculate low performers and high achievers
        const lowPerformers = studentsList.filter(s => s.average_score < 50 && s.total_attempts > 2);
        const highAchievers = studentsList.filter(s => s.average_score >= 85 && s.total_attempts >= 5);
        
        setAlerts(prev => ({ ...prev, low_performers: lowPerformers, high_achievers: highAchievers }));
      }
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const AlertCard = ({ title, count, icon: Icon, color, students, description }) => (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{count}</div>
      {students.length > 0 && (
        <div className="space-y-2">
          {students.slice(0, 3).map(student => (
            <div 
              key={student.id || student.student_id}
              onClick={() => navigate(`/tutor/students/${student.id || student.student_id}`)}
              className={`p-3 rounded cursor-pointer ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition`}
            >
              <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {student.average_score !== undefined ? `Avg: ${student.average_score}%` : 'No recent activity'}
              </div>
            </div>
          ))}
          {students.length > 3 && (
            <button 
              onClick={() => navigate('/tutor/students')}
              className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}
            >
              View all {students.length} students
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student Alerts</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Monitor students needing attention</p>
          </div>
          <button onClick={() => navigate('/tutor')} className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AlertCard
            title="Inactive Students"
            count={alerts.inactive_count || alerts.inactive_students?.length || 0}
            icon={Clock}
            color="bg-yellow-500"
            students={alerts.inactive_students || []}
            description="No activity in last 7 days"
          />
          
          <AlertCard
            title="Low Performers"
            count={alerts.low_performers?.length || 0}
            icon={TrendingDown}
            color="bg-red-500"
            students={alerts.low_performers || []}
            description="Average score below 50%"
          />
          
          <AlertCard
            title="High Achievers"
            count={alerts.high_achievers?.length || 0}
            icon={Award}
            color="bg-green-500"
            students={alerts.high_achievers || []}
            description="Average score above 85%"
          />
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mt-6`}>
          <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recommendations</h3>
          <div className="space-y-3">
            {alerts.inactive_students?.length > 0 && (
              <div className={`p-4 rounded ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                <p className={`font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>⚠️ Reach out to inactive students</p>
                <p className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Send reminders or check if they need help</p>
              </div>
            )}
            {alerts.low_performers?.length > 0 && (
              <div className={`p-4 rounded ${isDarkMode ? 'bg-red-900/20 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
                <p className={`font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-800'}`}>📉 Provide extra support to struggling students</p>
                <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Consider one-on-one sessions or additional resources</p>
              </div>
            )}
            {alerts.high_achievers?.length > 0 && (
              <div className={`p-4 rounded ${isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                <p className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>🏆 Recognize high achievers</p>
                <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Celebrate their success and challenge them with advanced material</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAlerts;
