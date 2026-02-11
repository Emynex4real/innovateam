import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Award, 
  ArrowLeft, 
  ChevronRight, 
  User, 
  CheckCircle, 
  Bell,
  RefreshCw
} from 'lucide-react';

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
        
        // Calculate low performers and high achievers locally if API doesn't provide fully
        const lowPerformers = studentsList.filter(s => s.average_score < 50 && s.total_attempts >= 2);
        const highAchievers = studentsList.filter(s => s.average_score >= 85 && s.total_attempts >= 3);
        
        setAlerts(prev => ({ 
            ...prev, 
            low_performers: lowPerformers, 
            high_achievers: highAchievers 
        }));
      }
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Analyzing student performance...</p>
      </div>
    );
  }

  // Helper Component for the Student Lists within Cards
  const StudentListRow = ({ student, metric, colorClass }) => (
    <div 
      onClick={() => navigate(`/tutor/students/${student.id || student.student_id}/profile`)}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors group ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          {student.name?.charAt(0) || '?'}
        </div>
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.name || 'Unknown'}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{student.email || 'N/A'}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-xs font-bold px-2 py-1 rounded-md ${colorClass}`}>
          {metric}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
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
              <Bell className="text-indigo-500" /> Student Alerts & Insights
            </h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time monitoring of student engagement and performance
            </p>
          </div>
          <button 
            onClick={loadData}
            className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'border-gray-800 hover:bg-gray-800 text-gray-400' : 'border-gray-200 hover:bg-white text-gray-600'}`}
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Inactive Students (Warning) */}
          <div className={`rounded-xl border shadow-sm flex flex-col ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base">Inactive</h3>
                  <p className="text-xs text-gray-500">No activity (7 days)</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-600">{alerts.inactive_students?.length || 0}</span>
            </div>
            
            <div className="p-2 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
              {alerts.inactive_students?.length > 0 ? (
                alerts.inactive_students.slice(0, 5).map((student, idx) => (
                  <StudentListRow 
                    key={idx} 
                    student={student} 
                    metric="Dormant" 
                    colorClass="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <CheckCircle size={32} className="mb-2 text-green-500/50" />
                  <p className="text-sm">Everyone is active!</p>
                </div>
              )}
            </div>
            
            {alerts.inactive_students?.length > 5 && (
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center">
                <button className="text-xs font-medium text-blue-600 hover:underline">View All Inactive</button>
              </div>
            )}
          </div>

          {/* Card 2: Low Performers (Critical) */}
          <div className={`rounded-xl border shadow-sm flex flex-col ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base">Needs Support</h3>
                  <p className="text-xs text-gray-500">Avg score &lt; 50%</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">{alerts.low_performers?.length || 0}</span>
            </div>
            
            <div className="p-2 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
              {alerts.low_performers?.length > 0 ? (
                alerts.low_performers.slice(0, 5).map((student, idx) => (
                  <StudentListRow 
                    key={idx} 
                    student={student} 
                    metric={`${student.average_score}% Avg`} 
                    colorClass="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <CheckCircle size={32} className="mb-2 text-green-500/50" />
                  <p className="text-sm">No students at risk.</p>
                </div>
              )}
            </div>
             {alerts.low_performers?.length > 5 && (
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center">
                <button className="text-xs font-medium text-blue-600 hover:underline">View All At Risk</button>
              </div>
            )}
          </div>

          {/* Card 3: High Achievers (Positive) */}
          <div className={`rounded-xl border shadow-sm flex flex-col ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base">Top Talent</h3>
                  <p className="text-xs text-gray-500">Avg score &gt; 85%</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-emerald-600">{alerts.high_achievers?.length || 0}</span>
            </div>
            
            <div className="p-2 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
              {alerts.high_achievers?.length > 0 ? (
                alerts.high_achievers.slice(0, 5).map((student, idx) => (
                  <StudentListRow 
                    key={idx} 
                    student={student} 
                    metric={`${student.average_score}% Avg`} 
                    colorClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <p className="text-sm">No top performers yet.</p>
                </div>
              )}
            </div>
             {alerts.high_achievers?.length > 5 && (
              <div className="p-3 border-t border-gray-100 dark:border-gray-800 text-center">
                <button className="text-xs font-medium text-blue-600 hover:underline">View All Top Students</button>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className={`rounded-xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50/50'}`}>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle size={18} className="text-indigo-500" /> Actionable Recommendations
            </h2>
          </div>
          
          <div className="p-6 grid gap-4 md:grid-cols-3">
            {alerts.inactive_students?.length > 0 ? (
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50 border-amber-100'}`}>
                <div>
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-1">Re-engage Students</h4>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/70 mb-4">
                    {alerts.inactive_students.length} students haven't been active lately. Send a broadcast email or announcement.
                  </p>
                </div>
                <button className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${isDarkMode ? 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                  Send Reminder
                </button>
              </div>
            ) : (
                <div className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-center opacity-50 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <CheckCircle className="mb-2 text-green-500" />
                    <p className="text-sm">Engagement is good!</p>
                </div>
            )}

            {alerts.low_performers?.length > 0 ? (
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-100'}`}>
                <div>
                  <h4 className="font-bold text-red-700 dark:text-red-400 mb-1">Intervention Needed</h4>
                  <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-4">
                    {alerts.low_performers.length} students are struggling. Consider assigning remedial tests or one-on-one sessions.
                  </p>
                </div>
                <button className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${isDarkMode ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                  Create Remedial Test
                </button>
              </div>
            ) : (
                <div className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-center opacity-50 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <CheckCircle className="mb-2 text-green-500" />
                    <p className="text-sm">Performance is stable.</p>
                </div>
            )}

            {alerts.high_achievers?.length > 0 ? (
              <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'}`}>
                <div>
                  <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-1">Challenge Top Students</h4>
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70 mb-4">
                    {alerts.high_achievers.length} students are excelling. Keep them engaged with advanced material.
                  </p>
                </div>
                <button className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${isDarkMode ? 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                  Assign Advanced Work
                </button>
              </div>
            ) : (
                <div className={`p-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-center opacity-50 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                    <p className="text-sm">No outliers detected.</p>
                </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentAlerts;