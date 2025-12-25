import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentProfile = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('overview');
  const [student, setStudent] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('week');

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      const [profileRes, historyRes, analyticsRes, progressRes, notesRes] = await Promise.all([
        tutorialCenterService.getStudentProfile(studentId),
        tutorialCenterService.getStudentTestHistory(studentId),
        tutorialCenterService.getStudentAnalytics(studentId),
        tutorialCenterService.getStudentProgress(studentId, 'month'),
        tutorialCenterService.getStudentNotes(studentId)
      ]);

      if (profileRes.success) setStudent(profileRes.student);
      if (historyRes.success) setTestHistory(historyRes.attempts);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (progressRes.success) setProgress(progressRes.progress);
      if (notesRes.success) setNotes(notesRes.notes);
    } catch (error) {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await tutorialCenterService.addStudentNote(studentId, newNote);
      if (res.success) {
        setNotes([res.note, ...notes]);
        setNewNote('');
        toast.success('Note added');
      }
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await tutorialCenterService.generateStudentReport(studentId, reportPeriod);
      if (res.success) {
        const blob = new Blob([JSON.stringify(res.report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${student.name}_report_${reportPeriod}.json`;
        a.click();
        toast.success('Report generated');
      }
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  if (loading) {
    return <div className={`flex justify-center items-center min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!student) {
    return <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'} p-8`}><p>Student not found</p></div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <button onClick={() => navigate('/tutor/students')} className={`mb-4 ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}>← Back to Students</button>

        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</h1>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{student.email}</p>
            </div>
            <div className="text-right">
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Level {student.level}</div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.total_xp} XP</div>
              <div className={`text-xs px-2 py-1 rounded ${student.tier === 'gold' ? 'bg-yellow-100 text-yellow-800' : student.tier === 'silver' ? 'bg-gray-300 text-gray-800' : 'bg-orange-100 text-orange-800'}`}>{student.tier.toUpperCase()}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded`}>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tests Taken</div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.total_tests}</div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded`}>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</div>
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{student.average_score}%</div>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded`}>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Enrolled</div>
              <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(student.enrolled_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg mb-6`}>
          <div className="flex border-b border-gray-700">
            {['overview', 'history', 'progress', 'notes', 'reports'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-semibold ${activeTab === tab ? (isDarkMode ? 'border-b-2 border-blue-500 text-blue-500' : 'border-b-2 border-blue-600 text-blue-600') : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Subject Performance</h3>
                {analytics.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgScore" fill="#3b82f6" name="Average Score" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No data available</p>}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Test History</h3>
                <div className="space-y-3">
                  {testHistory.map(attempt => (
                    <div key={attempt.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded flex justify-between items-center`}>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{attempt.tc_question_sets?.title || 'Test'}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(attempt.completed_at).toLocaleString()}</div>
                      </div>
                      <div className={`text-2xl font-bold ${attempt.score >= 70 ? 'text-green-500' : attempt.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{attempt.score}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Progress Over Time</h3>
                {progress.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="completed_at" tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#3b82f6" name="Score" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No progress data</p>}
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tutor Notes</h3>
                <div className="mb-4">
                  <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note..." className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} rows="3"></textarea>
                  <button onClick={handleAddNote} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Note</button>
                </div>
                <div className="space-y-3">
                  {notes.map(note => (
                    <div key={note.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded`}>
                      <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{note.note}</p>
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(note.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Generate Report</h3>
                <div className="flex gap-4 items-center">
                  <select value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)} className={`p-2 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                  </select>
                  <button onClick={handleGenerateReport} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Generate Report</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
