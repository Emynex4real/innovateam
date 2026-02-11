import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  ArrowLeft, 
  Trash2, 
  Play, 
  Pause, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart2, 
  Settings, 
  Users, 
  FileText, 
  HelpCircle, 
  Award, 
  Calendar,
  AlertCircle,
  Plus,
  Trophy,
  Target,
  Eye,
  EyeOff
} from 'lucide-react';

const TestDetail = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('questions');
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestData();
  }, [testId]);

  const loadTestData = async () => {
    try {
      setLoading(true);
      const [testRes, questionsRes, attemptsRes] = await Promise.all([
        tutorialCenterService.getQuestionSets(),
        tutorialCenterService.getTestQuestions(testId),
        tutorialCenterService.getCenterAttempts()
      ]);

      if (testRes.success) {
        const foundTest = testRes.questionSets.find(t => String(t.id) === String(testId));
        setTest(foundTest);
      }
      if (questionsRes.success) setQuestions(questionsRes.questions);
      if (attemptsRes.success) {
        const testAttempts = attemptsRes.attempts.filter(a => String(a.question_set_id) === String(testId));
        setAttempts(testAttempts);
      }
    } catch (error) {
      console.error('Error loading test data:', error);
      toast.error('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await tutorialCenterService.deleteQuestion(questionId);
      toast.success('Question deleted successfully');
      loadTestData();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const toggleActive = async () => {
    try {
      await tutorialCenterService.updateQuestionSet(test.id, { is_active: !test.is_active });
      toast.success(`Test ${!test.is_active ? 'activated' : 'deactivated'}`);
      loadTestData();
    } catch (error) {
      toast.error('Failed to update test');
    }
  };

  const handleDeleteTest = async () => {
    if (!window.confirm('Delete this test? This cannot be undone.')) return;
    try {
      await tutorialCenterService.deleteQuestionSet(test.id);
      toast.success('Test deleted successfully');
      navigate('/tutor/tests');
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading test details...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'} p-8`}>
        <div className="text-center max-w-md">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'} mb-4`}>
             <AlertCircle size={32} className="text-gray-400" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Test Not Found</h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>The test you are looking for does not exist or has been deleted.</p>
          <button 
            onClick={() => navigate('/tutor/tests')} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <ArrowLeft size={16} /> Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const passRate = attempts.length > 0 
    ? Math.round((attempts.filter(a => a.score >= test.passing_score).length / attempts.length) * 100)
    : 0;
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
    : 0;

  const tabs = [
    { id: 'questions', label: 'Questions', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'attempts', label: 'Attempts', icon: Users },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Navigation */}
        <button
          onClick={() => navigate('/tutor/tests')}
          className={`flex items-center gap-2 text-sm font-medium mb-6 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
        >
          <ArrowLeft size={16} /> Back to All Tests
        </button>

        {/* Main Header Card */}
        <div className={`rounded-xl border shadow-sm p-6 mb-8 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    test.is_active 
                      ? isDarkMode ? 'bg-emerald-900/30 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700' : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}>
                    {test.is_active ? <Play size={10} fill="currentColor" /> : <Pause size={10} fill="currentColor" />}
                    {test.is_active ? 'Active' : 'Inactive'}
                </span>
                <h1 className="text-3xl font-bold tracking-tight">{test.title}</h1>
              </div>
              
              <p className={`mb-6 max-w-2xl text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {test.description || "No description provided for this test."}
              </p>

              <div className="flex flex-wrap gap-4 sm:gap-6">
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <FileText size={16} className="text-indigo-500" />
                  <span className="font-medium">{questions.length}</span> Questions
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Clock size={16} className="text-indigo-500" />
                  <span className="font-medium">{test.time_limit}</span> Mins Limit
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Award size={16} className="text-indigo-500" />
                  <span className="font-medium">{test.passing_score}%</span> Pass Score
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Users size={16} className="text-indigo-500" />
                  <span className="font-medium">{attempts.length}</span> Attempts
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <button
                onClick={toggleActive}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all ${
                  test.is_active
                    ? isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent shadow-sm'
                }`}
              >
                {test.is_active ? <Pause size={18} /> : <Play size={18} />}
                {test.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={handleDeleteTest}
                className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all ${
                   isDarkMode 
                    ? 'bg-red-900/20 border-red-900/30 text-red-400 hover:bg-red-900/30' 
                    : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                }`}
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-6">
          
          {/* Tabs Navigation */}
          <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                      ${isActive 
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'}
                    `}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[400px]">
            
            {/* --- QUESTIONS TAB --- */}
            {activeTab === 'questions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Question Bank</h3>
                  <button
                    onClick={() => navigate('/tutor/questions')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                  >
                    <Plus size={18} /> Add Questions
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className={`text-center py-16 rounded-xl border border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-300 bg-gray-50'}`}>
                    <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-sm'} mb-4`}>
                      <HelpCircle size={24} className="text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-medium">No questions yet</h3>
                    <p className={`mt-1 mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start building your test by adding questions.</p>
                    <button
                      onClick={() => navigate('/tutor/questions')}
                      className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                    >
                      Open Question Builder
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className={`group relative p-5 rounded-xl border transition-all ${
                          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className={`p-2 rounded-lg transition-colors ${
                                isDarkMode ? 'bg-gray-800 text-red-400 hover:bg-red-900/30' : 'bg-gray-100 text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete Question"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex gap-4">
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                              isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            {idx + 1}
                          </span>
                          
                          <div className="flex-1">
                             <div className="flex flex-wrap gap-2 mb-3">
                                {q.difficulty && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                    q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    q.difficulty === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                    {q.difficulty}
                                </span>
                                )}
                                {q.topic && <span className={`px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`}>{q.topic}</span>}
                             </div>

                            <p className="text-base font-medium mb-4 pr-8">{q.question_text}</p>
                            
                            <div className="grid gap-2 mb-4 sm:grid-cols-2">
                              {q.options?.map((option, i) => {
                                const optionLetter = ['A', 'B', 'C', 'D'][i];
                                const isCorrect = optionLetter === q.correct_answer;
                                // Handle string formats like "A. Text" vs "Text"
                                const optionText = typeof option === 'string' && option.match(/^[A-D]\.\s/) ? option.substring(3) : option;

                                return (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-3 p-3 rounded-lg border text-sm transition-colors ${
                                      isCorrect
                                        ? isDarkMode ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : isDarkMode ? 'bg-gray-800/50 border-gray-800 text-gray-400' : 'bg-gray-50 border-transparent text-gray-600'
                                    }`}
                                  >
                                    <span className={`font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>{optionLetter}.</span>
                                    <span className="flex-1">{optionText}</span>
                                    {isCorrect && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
                                  </div>
                                );
                              })}
                            </div>

                            {q.explanation && (
                              <div className={`flex gap-3 p-3 rounded-lg text-sm ${isDarkMode ? 'bg-indigo-900/20 text-indigo-300' : 'bg-indigo-50 text-indigo-800'}`}>
                                <HelpCircle size={18} className="shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block mb-1">Explanation:</span>
                                    {q.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- ANALYTICS TAB --- */}
            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1 */}
                   <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                            <Users size={24} />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>All Time</span>
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Attempts</p>
                        <h3 className="text-3xl font-bold mt-1">{attempts.length}</h3>
                    </div>
                   </div>

                   {/* Stat Card 2 */}
                   <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            <Target size={24} />
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${passRate >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {passRate >= 70 ? 'Excellent' : 'Needs Work'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pass Rate</p>
                        <h3 className="text-3xl font-bold mt-1">{passRate}%</h3>
                    </div>
                   </div>

                   {/* Stat Card 3 */}
                   <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                            <Award size={24} />
                        </div>
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Average Score</p>
                        <h3 className="text-3xl font-bold mt-1">{avgScore}%</h3>
                    </div>
                   </div>
                </div>

                {/* Call to Action */}
                <div className={`flex flex-col sm:flex-row items-center justify-between p-8 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-100'}`}>
                   <div className="mb-4 sm:mb-0">
                        <h3 className="text-lg font-bold mb-1">Student Leaderboard</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>View detailed performance breakdown for every student.</p>
                   </div>
                   <button
                    onClick={() => navigate(`/tutor/leaderboard/${test.id}`)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                   >
                     <Trophy size={18} /> View Leaderboard
                   </button>
                </div>
              </div>
            )}

            {/* --- SETTINGS TAB --- */}
            {activeTab === 'settings' && (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold">Configuration</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Helper Component for Settings Item */}
                  {[
                    { label: 'Time Limit', value: `${test.time_limit} Minutes`, icon: Clock },
                    { label: 'Passing Score', value: `${test.passing_score}%`, icon: Target },
                    { label: 'Visibility', value: test.visibility === 'public' ? 'Public (Visible to all)' : 'Private (Link only)', icon: test.visibility === 'public' ? Eye : EyeOff },
                    { label: 'Show Answers', value: test.show_answers ? 'Yes, after submission' : 'No, hidden always', icon: HelpCircle },
                    { label: 'Max Attempts', value: test.max_attempts || 'Unlimited', icon: AlertCircle },
                    { label: 'Cooldown Period', value: test.cooldown_hours ? `${test.cooldown_hours} Hours` : 'No cooldown', icon: Clock },
                    { label: 'Score Policy', value: test.score_policy === 'best' ? 'Best Score' : test.score_policy === 'average' ? 'Average' : 'Last Attempt', icon: Award },
                  ].map((setting, i) => (
                    <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            <setting.icon size={20} />
                        </div>
                        <div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{setting.label}</p>
                            <p className="font-semibold mt-0.5">{setting.value}</p>
                        </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-dashed border-gray-200 dark:border-gray-800">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-red-500 mb-4">Danger Zone</h4>
                    <div className={`flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30`}>
                        <div className="mb-4 sm:mb-0">
                            <h5 className="font-bold text-red-900 dark:text-red-200">Delete this Test</h5>
                            <p className="text-sm text-red-700 dark:text-red-300">Once deleted, all questions and student attempts will be permanently removed.</p>
                        </div>
                        <button 
                            onClick={handleDeleteTest}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/40"
                        >
                            Delete Permanently
                        </button>
                    </div>
                </div>
              </div>
            )}

            {/* --- ATTEMPTS TAB --- */}
            {activeTab === 'attempts' && (
              <div className="animate-in fade-in">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold">Recent Student Attempts</h3>
                   <span className={`text-sm px-3 py-1 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                     Total: {attempts.length}
                   </span>
                </div>

                {attempts.length === 0 ? (
                  <div className={`text-center py-16 rounded-xl border border-dashed ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-300 bg-gray-50'}`}>
                    <Users size={40} className={`mx-auto mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                    <p className={`text-gray-500`}>No students have attempted this test yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attempts.slice(0, 50).map((attempt) => {
                       const passed = attempt.score >= test.passing_score;
                       return (
                        <div
                            key={attempt.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
                            isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-start gap-4 mb-3 sm:mb-0">
                                <div className={`p-2 rounded-full ${passed ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                    {passed ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold">Student ID: {attempt.student_id}</p>
                                    <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <Calendar size={14} />
                                        {new Date(attempt.completed_at).toLocaleDateString()} at {new Date(attempt.completed_at).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 pl-12 sm:pl-0">
                                <div className="text-right">
                                    <span className={`block text-2xl font-bold ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {attempt.score}%
                                    </span>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {passed ? 'Passed' : 'Failed'}
                                    </span>
                                </div>
                            </div>
                        </div>
                       );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;