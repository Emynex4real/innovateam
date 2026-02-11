import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { generateClassTestReportPDF } from '../../utils/pdfReportGenerator';
import { 
  Search, 
  Plus, 
  BarChart2, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Trash2, 
  Calendar, 
  Award, 
  MoreHorizontal,
  FileDown,
  ChevronLeft,
  Layout
} from 'lucide-react';

const Tests = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Derived state for dashboard stats
  const activeTestsCount = tests.filter(t => t.is_active).length;
  const totalQuestions = tests.reduce((acc, curr) => acc + (curr.question_count?.[0]?.count || 0), 0);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const response = await tutorialCenterService.getQuestionSets();
      if (response.success) {
        setTests(response.questionSets);
      }
    } catch (error) {
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswers = async (id, currentState) => {
    try {
      await tutorialCenterService.toggleAnswers(id, !currentState);
      toast.success(`Answers ${!currentState ? 'revealed' : 'hidden'}`);
      loadTests();
    } catch (error) {
      toast.error('Failed to toggle answers');
    }
  };

  const toggleActive = async (id, currentState) => {
    const newState = !currentState;
    try {
      await tutorialCenterService.updateQuestionSet(id, { is_active: newState });
      toast.success(`Test ${newState ? 'activated' : 'deactivated'}`);
      loadTests();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update test');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) return;
    try {
      await tutorialCenterService.deleteQuestionSet(id);
      toast.success('Test deleted successfully');
      loadTests();
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const handleExportClassReport = async (test) => {
    const loadingToast = toast.loading('Generating class report...');
    try {
      const studentsResponse = await tutorialCenterService.getStudents();
      if (!studentsResponse.success) throw new Error('Failed to fetch students');
      
      const studentInfoMap = {};
      studentsResponse.students.forEach(s => {
        studentInfoMap[s.id] = { name: s.name, email: s.email };
      });
      
      const response = await tutorialCenterService.getCenterAttempts();
      if (!response.success) throw new Error('Failed to fetch attempts');
      
      const testAttempts = response.attempts.filter(a => a.question_set_id === test.id);
      
      if (testAttempts.length === 0) {
        toast.error('No students have taken this test yet', { id: loadingToast });
        return;
      }
      
      const studentMap = {};
      testAttempts.forEach(attempt => {
        const studentId = attempt.student_id;
        if (!studentMap[studentId] || attempt.score > studentMap[studentId].score) {
          studentMap[studentId] = attempt;
        }
      });
      
      const students = Object.values(studentMap)
        .map(attempt => {
          const correct = attempt.answers?.filter(a => a.is_correct).length || 0;
          const total = attempt.total_questions || attempt.answers?.length || 0;
          const score = attempt.score || 0;
          const studentInfo = studentInfoMap[attempt.student_id];
          
          return {
            name: studentInfo?.name || 'Unknown Student',
            email: studentInfo?.email || 'N/A',
            correct,
            total,
            score,
            time_taken: attempt.time_taken || 0
          };
        })
        .sort((a, b) => b.score - a.score);
      
      const scores = students.map(s => s.score);
      const passingScore = test.passing_score || 50;
      const summary = {
        total_students: students.length,
        passed: students.filter(s => s.score >= passingScore).length,
        failed: students.filter(s => s.score < passingScore).length,
        class_average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        highest_score: Math.max(...scores),
        lowest_score: Math.min(...scores)
      };
      
      const reportData = {
        test_name: test.title,
        test_date: test.created_at,
        students,
        summary,
        passing_score: passingScore
      };
      
      generateClassTestReportPDF(reportData);
      toast.success('Class report generated!', { id: loadingToast });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || 'Failed to generate report', { id: loadingToast });
    }
  };

  const filteredTests = tests.filter(test => 
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading assessment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate('/tutor')}
              className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
            >
              <ChevronLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Manager</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Create, manage, and track student assessments
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
             <button
              onClick={() => navigate('/tutor/analytics/advanced')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                isDarkMode 
                  ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm'
              }`}
            >
              <BarChart2 size={18} />
              Analytics
            </button>
            <button
              onClick={() => navigate('/tutor/tests/create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm hover:shadow transition-all text-sm font-medium"
            >
              <Plus size={18} />
              Create New Test
            </button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Assessments</p>
                <p className="text-2xl font-bold mt-1">{tests.length}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <FileText size={24} />
              </div>
            </div>
          </div>
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active Now</p>
                <p className="text-2xl font-bold mt-1">{activeTestsCount}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <CheckCircle size={24} />
              </div>
            </div>
          </div>
          <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Questions</p>
                <p className="text-2xl font-bold mt-1">{totalQuestions}</p>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <Layout size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
          </div>
          <input
            type="text"
            placeholder="Search tests by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full pl-10 pr-3 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 shadow-sm'
            }`}
          />
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-300 bg-gray-50'}`}>
            <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'}`}>
              <FileText size={32} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
            </div>
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>No assessments found</h3>
            <p className={`mt-1 text-center max-w-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchTerm ? `No results matching "${searchTerm}"` : "Get started by creating your first test for your students."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/tutor/tests/create')}
                className="mt-6 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
              >
                Create new test
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div 
                key={test.id} 
                className={`group flex flex-col rounded-xl border transition-all duration-200 hover:shadow-lg ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-800 hover:border-gray-700' 
                    : 'bg-white border-gray-200 hover:border-indigo-200 shadow-sm'
                }`}
              >
                {/* Card Header */}
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      test.is_active 
                        ? isDarkMode 
                          ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : isDarkMode
                          ? 'bg-gray-800 text-gray-400 border-gray-700'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {test.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex gap-2">
                       {test.visibility === 'public' ? (
                          <span title="Public Test" className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}><Layout size={16} /></span>
                       ) : (
                          <span title="Private Test" className="text-gray-400"><Layout size={16} /></span>
                       )}
                    </div>
                  </div>

                  <h3 
                    onClick={() => navigate(`/tutor/tests/${test.id}`)}
                    className="text-lg font-bold mb-2 cursor-pointer hover:text-indigo-500 transition-colors line-clamp-1"
                  >
                    {test.title}
                  </h3>
                  
                  <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {test.description || 'No description provided.'}
                  </p>

                  <div className={`grid grid-cols-2 gap-3 mb-4 text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-2">
                      <Layout size={14} className="text-indigo-500" />
                      <span>{test.question_count?.[0]?.count || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-indigo-500" />
                      <span>{test.time_limit} Mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-indigo-500" />
                      <span>Pass: {test.passing_score}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.show_answers ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} className="text-orange-500" />}
                      <span>{test.show_answers ? 'Answers Shown' : 'Answers Hidden'}</span>
                    </div>
                  </div>

                  {/* Scheduled Info Badge */}
                  {(test.scheduled_start || test.is_recurring) && (
                    <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-start gap-2 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                      <Calendar size={14} className="mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        {test.scheduled_start && <div>Start: {new Date(test.scheduled_start).toLocaleDateString()}</div>}
                        {test.is_recurring && <div className="font-medium text-indigo-500">Recurring: {test.recurrence_pattern}</div>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className={`px-5 py-4 border-t flex items-center justify-between ${isDarkMode ? 'border-gray-800 bg-gray-800/20' : 'border-gray-100 bg-gray-50/50'}`}>
                  <button
                    onClick={() => navigate(`/tutor/tests/${test.id}`)}
                    className={`text-sm font-semibold hover:underline ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1">
                     <button
                      onClick={() => handleExportClassReport(test)}
                      title="Export Class Report"
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-indigo-400' : 'hover:bg-white hover:shadow-sm text-indigo-600'}`}
                    >
                      <FileDown size={18} />
                    </button>
                    
                    <button
                      onClick={() => navigate(`/tutor/leaderboard/${test.id}`)}
                      title="View Leaderboard"
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-amber-400' : 'hover:bg-white hover:shadow-sm text-amber-600'}`}
                    >
                      <Award size={18} />
                    </button>

                    <button
                      onClick={() => toggleActive(test.id, test.is_active)}
                      title={test.is_active ? "Deactivate Test" : "Activate Test"}
                      className={`p-2 rounded-lg transition-colors ${
                        test.is_active 
                          ? isDarkMode ? 'hover:bg-gray-800 text-emerald-400' : 'hover:bg-white hover:shadow-sm text-emerald-600'
                          : isDarkMode ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-white hover:shadow-sm text-gray-400'
                      }`}
                    >
                      {test.is_active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </button>

                    <button
                      onClick={() => toggleAnswers(test.id, test.show_answers)}
                      title={test.show_answers ? "Hide Answers from Students" : "Show Answers to Students"}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-blue-400' : 'hover:bg-white hover:shadow-sm text-blue-600'}`}
                    >
                      {test.show_answers ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>

                    <div className={`h-4 w-px mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

                    <button
                      onClick={() => handleDelete(test.id)}
                      title="Delete Test"
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;