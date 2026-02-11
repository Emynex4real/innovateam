import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  ArrowLeft, 
  Settings, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle, 
  Search, 
  Filter, 
  PlusCircle, 
  MinusCircle, 
  Layers, 
  Folder,
  ChevronRight,
  ChevronDown,
  Info,
  Save,
  Loader
} from 'lucide-react';

const TestBuilder = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [activeTab, setActiveTab] = useState('details'); // details, settings, schedule
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time_limit: 60,
    passing_score: 70,
    show_answers: false,
    visibility: 'private',
    max_attempts: 1,
    cooldown_hours: 0,
    score_policy: 'best',
    scheduled_start: '',
    scheduled_end: '',
    auto_activate: false,
    auto_deactivate: false,
    is_recurring: false,
    recurrence_pattern: 'daily',
    recurrence_days: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await tutorialCenterService.getQuestions();
      if (response.success) {
        setQuestions(response.questions);
        const grouped = {};
        response.questions.forEach(q => {
          const subject = q.subject || 'Uncategorized';
          const topic = q.topic || 'General';
          if (!grouped[subject]) grouped[subject] = {};
          if (!grouped[subject][topic]) grouped[subject][topic] = [];
          grouped[subject][topic].push(q);
        });
        setGroupedQuestions(grouped);
      }
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject) => {
    setExpandedSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
  };

  const toggleTopic = (subject, topic) => {
    const key = `${subject}-${topic}`;
    setExpandedTopics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAllInTopic = (subject, topic) => {
    const topicQuestions = groupedQuestions[subject][topic].map(q => q.id);
    const allSelected = topicQuestions.every(id => selectedQuestions.includes(id));
    if (allSelected) {
      setSelectedQuestions(prev => prev.filter(id => !topicQuestions.includes(id)));
    } else {
      setSelectedQuestions(prev => [...new Set([...prev, ...topicQuestions])]);
    }
  };

  const selectAllInSubject = (subject) => {
    const subjectQuestions = Object.values(groupedQuestions[subject]).flat().map(q => q.id);
    const allSelected = subjectQuestions.every(id => selectedQuestions.includes(id));
    if (allSelected) {
      setSelectedQuestions(prev => prev.filter(id => !subjectQuestions.includes(id)));
    } else {
      setSelectedQuestions(prev => [...new Set([...prev, ...subjectQuestions])]);
    }
  };

  const toggleQuestion = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
        toast.error("Please enter a test title");
        return;
    }
    if (selectedQuestions.length === 0) {
      toast.error('Select at least one question');
      return;
    }
    setSaving(true);
    try {
      const response = await tutorialCenterService.createQuestionSet(formData);
      if (response.success) {
        const addResult = await tutorialCenterService.addQuestionsToTest(response.questionSet.id, selectedQuestions);
        if (addResult.success) {
          toast.success(`Test created with ${addResult.added} questions!`);
          navigate('/tutor/tests');
        } else {
          toast.error('Test created but failed to add questions');
        }
      }
    } catch (error) {
      console.error('Test creation error:', error);
      toast.error(error.response?.data?.error || 'Failed to create test');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Loader className="animate-spin text-indigo-600 mb-4" size={32} />
        <p className="text-gray-500 font-medium">Loading test builder...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-20 px-6 py-4 border-b shadow-sm flex items-center justify-between ${isDarkMode ? 'bg-gray-900/95 border-gray-800 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tutor/tests')}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Test Builder</h1>
            <p className="text-xs text-gray-500">{selectedQuestions.length} questions selected</p>
          </div>
        </div>
        <div className="flex gap-3">
            <button
                onClick={() => navigate('/tutor/tests')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                Cancel
            </button>
            <button
                onClick={handleSubmit}
                disabled={saving || selectedQuestions.length === 0}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Creating...' : 'Create Test'}
            </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Configuration Form */}
        <div className="lg:col-span-5 space-y-6">
            <div className={`rounded-xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                {/* Tabs */}
                <div className={`flex border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    {[
                        { id: 'details', label: 'Details', icon: Info },
                        { id: 'settings', label: 'Settings', icon: Settings },
                        { id: 'schedule', label: 'Schedule', icon: Calendar },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                                activeTab === tab.id 
                                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {activeTab === 'details' && (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Test Title <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                    placeholder="e.g. Mathematics Final Exam"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-lg border text-sm transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                    rows={4}
                                    placeholder="Instructions for students..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Time Limit (mins)</label>
                                    <div className="relative">
                                        <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.time_limit}
                                            onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Pass Score (%)</label>
                                    <div className="relative">
                                        <CheckCircle size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.passing_score}
                                            onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                                            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-5 animate-in fade-in">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Visibility</label>
                                <select
                                    value={formData.visibility}
                                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                >
                                    <option value="private">🔒 Private (Center Only)</option>
                                    <option value="public">🌍 Public (Anyone with link)</option>
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Max Attempts</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.max_attempts}
                                        onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
                                        className={`w-full px-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Cooldown (Hours)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.cooldown_hours}
                                        onChange={(e) => setFormData({ ...formData, cooldown_hours: parseInt(e.target.value) })}
                                        className={`w-full px-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Score Policy</label>
                                <select
                                    value={formData.score_policy}
                                    onChange={(e) => setFormData({ ...formData, score_policy: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                >
                                    <option value="best">Best Score</option>
                                    <option value="average">Average Score</option>
                                    <option value="last">Most Recent Attempt</option>
                                    <option value="first">First Attempt Only</option>
                                </select>
                            </div>

                            <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.show_answers}
                                        onChange={(e) => setFormData({ ...formData, show_answers: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold block">Reveal Answers</span>
                                        <span className="text-xs text-gray-500">Show correct answers after submission</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-5 animate-in fade-in">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduled_start}
                                        onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                                        className={`w-full px-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.scheduled_end}
                                        onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                                        className={`w-full px-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.auto_activate} onChange={(e) => setFormData({ ...formData, auto_activate: e.target.checked })} className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm">Auto-activate at start time</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={formData.auto_deactivate} onChange={(e) => setFormData({ ...formData, auto_deactivate: e.target.checked })} className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm">Auto-deactivate at end time</span>
                                </label>
                            </div>

                            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                <label className="flex items-center gap-2 mb-4">
                                    <input type="checkbox" checked={formData.is_recurring} onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })} className="w-4 h-4 text-indigo-600" />
                                    <span className="text-sm font-bold">Enable Recurring Schedule</span>
                                </label>
                                
                                {formData.is_recurring && (
                                    <div className="pl-6 space-y-4">
                                        <select
                                            value={formData.recurrence_pattern}
                                            onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                                            className={`w-full px-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                        
                                        {formData.recurrence_pattern === 'weekly' && (
                                            <div className="flex flex-wrap gap-2">
                                                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, idx) => (
                                                    <label key={day} className={`px-3 py-1.5 text-xs rounded cursor-pointer border transition ${
                                                        formData.recurrence_days.includes(idx + 1)
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                                                    }`}>
                                                        <input type="checkbox" className="hidden" checked={formData.recurrence_days.includes(idx+1)} onChange={(e) => {
                                                            const days = e.target.checked ? [...formData.recurrence_days, idx + 1] : formData.recurrence_days.filter(d => d !== idx + 1);
                                                            setFormData({ ...formData, recurrence_days: days.sort() });
                                                        }} />
                                                        {day}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Question Selector */}
        <div className="lg:col-span-7 h-full flex flex-col">
            <div className={`rounded-xl border shadow-sm flex flex-col h-[calc(100vh-140px)] ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                
                {/* Selector Header */}
                <div className={`p-4 border-b flex flex-col sm:flex-row gap-3 justify-between items-center ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <h2 className="font-bold flex items-center gap-2">
                        <Layers size={18} className="text-indigo-500" /> Question Bank
                    </h2>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full sm:w-48 pl-9 pr-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-indigo-500 outline-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                            />
                        </div>
                        <select
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                            className={`px-3 py-2 rounded-lg text-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <option value="all">All Levels</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                {/* Questions List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {Object.keys(groupedQuestions).length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No questions found. Import some first!
                        </div>
                    ) : (
                        Object.keys(groupedQuestions).map(subject => {
                            const subjectQuestions = Object.values(groupedQuestions[subject]).flat();
                            const selectedInSubject = subjectQuestions.filter(q => selectedQuestions.includes(q.id)).length;
                            const isExpanded = expandedSubjects[subject];

                            return (
                                <div key={subject} className={`border rounded-lg overflow-hidden transition-all ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    {/* Subject Header */}
                                    <div 
                                        className={`flex items-center justify-between p-3 cursor-pointer ${isDarkMode ? 'hover:bg-gray-800 bg-gray-800/50' : 'hover:bg-gray-50 bg-gray-50'}`}
                                        onClick={() => toggleSubject(subject)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white border border-gray-200 text-gray-500'}`}>
                                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </div>
                                            <span className="font-semibold text-sm">{subject}</span>
                                            <span className="text-xs text-gray-500">({subjectQuestions.length})</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {selectedInSubject > 0 && (
                                                <span className="text-xs font-medium text-indigo-500">{selectedInSubject} selected</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); selectAllInSubject(subject); }}
                                                className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 ${selectedInSubject === subjectQuestions.length ? 'text-indigo-600' : 'text-gray-400'}`}
                                                title="Select All"
                                            >
                                                {selectedInSubject === subjectQuestions.length ? <CheckCircle size={18} /> : <PlusCircle size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Topic List */}
                                    {isExpanded && (
                                        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            {Object.keys(groupedQuestions[subject]).map(topic => {
                                                const topicQuestions = groupedQuestions[subject][topic].filter(q => {
                                                    const matchesSearch = !searchTerm || q.question_text.toLowerCase().includes(searchTerm.toLowerCase());
                                                    const matchesDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
                                                    return matchesSearch && matchesDiff;
                                                });

                                                if (topicQuestions.length === 0) return null;

                                                const topicKey = `${subject}-${topic}`;
                                                const selectedInTopic = topicQuestions.filter(q => selectedQuestions.includes(q.id)).length;
                                                const isTopicExpanded = expandedTopics[topicKey];

                                                return (
                                                    <div key={topic} className={`border-b last:border-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                                        <div 
                                                            className={`flex items-center justify-between p-2 pl-10 cursor-pointer ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
                                                            onClick={() => toggleTopic(subject, topic)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-gray-400 transition-transform ${isTopicExpanded ? 'rotate-90' : ''}`}><ChevronRight size={12} /></span>
                                                                <span className="text-sm font-medium">{topic}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); selectAllInTopic(subject, topic); }}
                                                                className={`text-xs px-2 py-0.5 rounded border transition ${selectedInTopic === topicQuestions.length ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'border-gray-200 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700'}`}
                                                            >
                                                                {selectedInTopic === topicQuestions.length ? 'All' : 'Select'}
                                                            </button>
                                                        </div>

                                                        {isTopicExpanded && (
                                                            <div className="grid gap-2 p-2 pl-12 bg-black/5 dark:bg-white/5">
                                                                {topicQuestions.map(q => (
                                                                    <div 
                                                                        key={q.id}
                                                                        onClick={() => toggleQuestion(q.id)}
                                                                        className={`p-3 rounded border cursor-pointer flex gap-3 items-start transition-all ${
                                                                            selectedQuestions.includes(q.id) 
                                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm' 
                                                                            : isDarkMode ? 'bg-gray-900 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                    >
                                                                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${selectedQuestions.includes(q.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                                                                            {selectedQuestions.includes(q.id) && <CheckCircle size={12} className="text-white" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm line-clamp-2 mb-1 font-medium">{q.question_text}</p>
                                                                            <div className="flex gap-2">
                                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                                                                                    q.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                                                    q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                                    'bg-red-100 text-red-700'
                                                                                }`}>{q.difficulty}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};

export default TestBuilder;