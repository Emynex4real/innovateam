import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MathText from '../../components/MathText';
import TagInput from '../../components/TagInput';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Upload, 
  Brain, 
  LayoutList, 
  FolderTree,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  X,
  CheckSquare,
  Square,
  MoreVertical,
  Edit2
} from 'lucide-react';

const Questions = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [questions, setQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('hierarchical');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', difficulty: '', category: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: 'A',
    explanation: '',
    subject: '',
    topic: '',
    difficulty: 'medium',
    category: '',
    tags: [],
    year: '',
    exam_type: ''
  });
  
  const [tagSuggestions] = useState([
    'algebra', 'geometry', 'calculus', 'trigonometry', 'statistics',
    'mechanics', 'electricity', 'waves', 'organic-chemistry', 'inorganic-chemistry',
    'biology', 'ecology', 'genetics', 'literature', 'grammar', 'comprehension',
    'jamb-2024', 'jamb-2023', 'waec', 'neco', 'past-questions', 'practice',
    'difficult', 'frequently-asked'
  ]);

  useEffect(() => {
    loadQuestions();
  }, [filter]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await tutorialCenterService.getQuestions(filter);
      if (response.success) {
        setQuestions(response.questions);
        groupQuestions(response.questions);
      }
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const groupQuestions = (qs) => {
    const grouped = {};
    qs.forEach(q => {
      const subject = q.subject || 'Uncategorized';
      const topic = q.topic || 'General';
      if (!grouped[subject]) grouped[subject] = {};
      if (!grouped[subject][topic]) grouped[subject][topic] = [];
      grouped[subject][topic].push(q);
    });
    setGroupedQuestions(grouped);
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
    setSelectedQuestions(prev => 
      allSelected ? prev.filter(id => !topicQuestions.includes(id)) : [...new Set([...prev, ...topicQuestions])]
    );
  };

  const selectAllInSubject = (subject) => {
    const subjectQuestions = Object.values(groupedQuestions[subject]).flat().map(q => q.id);
    const allSelected = subjectQuestions.every(id => selectedQuestions.includes(id));
    setSelectedQuestions(prev => 
      allSelected ? prev.filter(id => !subjectQuestions.includes(id)) : [...new Set([...prev, ...subjectQuestions])]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      toast.error('No questions selected');
      return;
    }
    if (!window.confirm(`Delete ${selectedQuestions.length} questions? This cannot be undone.`)) return;
    
    const toastId = toast.loading(`Deleting ${selectedQuestions.length} questions...`);
    try {
      let deleted = 0;
      for (const id of selectedQuestions) {
        await tutorialCenterService.deleteQuestion(id);
        deleted++;
        if (deleted % 5 === 0) {
          toast.loading(`Deleting ${deleted}/${selectedQuestions.length}...`, { id: toastId });
        }
      }
      toast.success(`Deleted ${deleted} questions`, { id: toastId });
      setSelectedQuestions([]);
      loadQuestions();
    } catch (error) {
      toast.error('Failed to delete some questions', { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await tutorialCenterService.updateQuestion(editingId, formData);
        toast.success('Question updated');
      } else {
        await tutorialCenterService.createQuestion(formData);
        toast.success('Question created');
      }
      resetForm();
      loadQuestions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setFormData(question);
    setEditingId(question.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await tutorialCenterService.deleteQuestion(id);
      toast.success('Question deleted');
      loadQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: 'A',
      explanation: '',
      subject: '',
      topic: '',
      difficulty: 'medium',
      category: '',
      tags: [],
      year: '',
      exam_type: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !searchTerm || q.question_text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading question bank...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate('/tutor')} 
              className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold tracking-tight">Question Bank</h1>
            <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage {questions.length} questions across various subjects
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
              onClick={() => navigate('/tutor/questions/bulk-import')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Bulk Questions</span>
            </button>
            <button 
              onClick={() => navigate('/tutor/questions/generate')} 
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium transition-all ${isDarkMode ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400 hover:bg-emerald-900/50' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}
            >
              <Brain size={18} />
              <span className="hidden sm:inline">AI Generator</span>
            </button>
            <button 
              onClick={() => setShowForm(true)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-all font-medium"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Question</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Toolbar Section */}
        <div className={`rounded-xl border shadow-sm p-4 mb-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search questions content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Filters & View Toggle */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
               <div className="flex items-center gap-2 p-1 rounded-lg border bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <select 
                    value={filter.category} 
                    onChange={(e) => setFilter({ ...filter, category: e.target.value })} 
                    className="bg-transparent text-sm font-medium border-none focus:ring-0 text-gray-700 dark:text-gray-300 py-1"
                  >
                    <option value="">All Categories</option>
                    <option value="Science">Science</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Arts">Arts</option>
                    <option value="General">General</option>
                  </select>
                  <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  <select 
                    value={filter.difficulty} 
                    onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })} 
                    className="bg-transparent text-sm font-medium border-none focus:ring-0 text-gray-700 dark:text-gray-300 py-1"
                  >
                    <option value="">Any Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
               </div>

               <div className={`flex rounded-lg border p-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <button 
                    onClick={() => setViewMode('hierarchical')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'hierarchical' ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    title="Tree View"
                  >
                    <FolderTree size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('flat')}
                    className={`p-2 rounded-md transition-all ${viewMode === 'flat' ? 'bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    title="List View"
                  >
                    <LayoutList size={18} />
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Selection Context Bar */}
        {selectedQuestions.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-full shadow-xl px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-4">
            <span className="font-medium text-sm whitespace-nowrap">{selectedQuestions.length} selected</span>
            <div className="h-4 w-px bg-gray-600 dark:bg-gray-300"></div>
            <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 dark:text-red-600 dark:hover:text-red-700 text-sm font-bold transition-colors"
            >
                <Trash2 size={16} /> Delete
            </button>
            <button 
                onClick={() => setSelectedQuestions([])} 
                className="text-gray-400 hover:text-white dark:text-gray-500 dark:hover:text-gray-900 text-sm"
            >
                Cancel
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[400px]">
           {viewMode === 'hierarchical' ? (
             <div className="space-y-4">
                {Object.keys(groupedQuestions).length === 0 && (
                    <EmptyState navigate={navigate} />
                )}
                {Object.keys(groupedQuestions).map(subject => {
                  const subjectQuestions = Object.values(groupedQuestions[subject]).flat();
                  const selectedInSubject = subjectQuestions.filter(q => selectedQuestions.includes(q.id)).length;
                  const isExpanded = expandedSubjects[subject];
                  
                  return (
                    <div key={subject} className={`rounded-xl border overflow-hidden transition-all ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'}`}>
                      {/* Subject Header */}
                      <div 
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                        }`} 
                        onClick={() => toggleSubject(subject)}
                      >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isExpanded ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                                {isExpanded ? <FolderOpen size={20} /> : <Folder size={20} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-base">{subject}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{subjectQuestions.length} questions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className={`text-xs px-2 py-1 rounded font-medium ${selectedInSubject > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'}`}>
                                {selectedInSubject} selected
                             </div>
                             <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); selectAllInSubject(subject); }} 
                                className={`p-2 rounded-lg transition ${
                                    selectedInSubject === subjectQuestions.length 
                                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                                title="Select All in Subject"
                             >
                                {selectedInSubject === subjectQuestions.length ? <CheckSquare size={18} /> : <Square size={18} />}
                             </button>
                             {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                        </div>
                      </div>

                      {/* Topic List */}
                      {isExpanded && (
                        <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                          {Object.keys(groupedQuestions[subject]).map(topic => {
                            const topicQuestions = groupedQuestions[subject][topic];
                            const selectedInTopic = topicQuestions.filter(q => selectedQuestions.includes(q.id)).length;
                            const topicKey = `${subject}-${topic}`;
                            const isTopicExpanded = expandedTopics[topicKey];
                            
                            return (
                              <div key={topic} className={`border-b last:border-0 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                <div 
                                    className={`flex items-center justify-between p-3 pl-6 md:pl-12 cursor-pointer transition-colors ${
                                        isDarkMode ? 'hover:bg-gray-800/50 bg-gray-900' : 'hover:bg-gray-50 bg-gray-50/30'
                                    }`} 
                                    onClick={() => toggleTopic(subject, topic)}
                                >
                                  <div className="flex items-center gap-3">
                                     <div className={`text-gray-400 transition-transform duration-200 ${isTopicExpanded ? 'rotate-90' : ''}`}>
                                        <ChevronRight size={16} />
                                     </div>
                                     <span className="font-medium text-sm">{topic}</span>
                                     <span className="text-xs text-gray-400">({topicQuestions.length})</span>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={(e) => { e.stopPropagation(); selectAllInTopic(subject, topic); }} 
                                    className={`p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition ${
                                        selectedInTopic === topicQuestions.length ? 'text-green-600' : 'text-gray-400'
                                    }`}
                                  >
                                     {selectedInTopic === topicQuestions.length ? <CheckSquare size={16} /> : <Square size={16} />}
                                  </button>
                                </div>

                                {isTopicExpanded && (
                                  <div className={`p-4 pl-6 md:pl-16 grid gap-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                                    {topicQuestions.map((q) => (
                                      <QuestionCard 
                                        key={q.id} 
                                        question={q} 
                                        isSelected={selectedQuestions.includes(q.id)}
                                        toggleSelect={() => setSelectedQuestions(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        isDarkMode={isDarkMode}
                                      />
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
                })}
             </div>
           ) : (
             <div className="grid gap-4">
                {filteredQuestions.length === 0 ? (
                    <EmptyState navigate={navigate} isSearch={!!searchTerm} />
                ) : (
                    filteredQuestions.map((q) => (
                        <QuestionCard 
                            key={q.id} 
                            question={q} 
                            isSelected={selectedQuestions.includes(q.id)}
                            toggleSelect={() => setSelectedQuestions(prev => prev.includes(q.id) ? prev.filter(id => id !== q.id) : [...prev, q.id])}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            isDarkMode={isDarkMode}
                        />
                    ))
                )}
             </div>
           )}
        </div>

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'} rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl`}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold">{editingId ? 'Edit Question' : 'Add New Question'}</h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="questionForm" onSubmit={handleSubmit} className="space-y-6">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Question Text <span className="text-red-500">*</span></label>
                    <textarea 
                        required 
                        value={formData.question_text} 
                        onChange={(e) => setFormData({ ...formData, question_text: e.target.value })} 
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`} 
                        rows="3" 
                        placeholder="Type the question here..."
                    />
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map((letter, idx) => (
                       <div key={letter}>
                          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Option {letter}</label>
                          <div className="flex items-center gap-2">
                             <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${formData.correct_answer === letter ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                {letter}
                             </span>
                             <input 
                                required 
                                value={formData.options[idx]} 
                                onChange={(e) => { const newOptions = [...formData.options]; newOptions[idx] = e.target.value; setFormData({ ...formData, options: newOptions }); }} 
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} 
                                placeholder={`Answer for option ${letter}`}
                             />
                          </div>
                       </div>
                    ))}
                  </div>

                  {/* Meta Data Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">Correct Answer</label>
                        <select value={formData.correct_answer} onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })} className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
                            {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>Option {opt}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Difficulty</label>
                        <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Category</label>
                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`}>
                            <option value="">Select...</option>
                            <option value="Science">Science</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Arts">Arts</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2">Subject</label>
                        <input required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} placeholder="e.g. Mathematics" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold mb-2">Topic (Optional)</label>
                        <input value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} placeholder="e.g. Algebra" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold mb-2">Tags</label>
                        <TagInput tags={formData.tags} onChange={(tags) => setFormData({ ...formData, tags })} suggestions={tagSuggestions} placeholder="Add tags..." />
                     </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold mb-2">Explanation</label>
                     <textarea required value={formData.explanation} onChange={(e) => setFormData({ ...formData, explanation: e.target.value })} className={`w-full px-4 py-3 border rounded-lg ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}`} rows="2" placeholder="Explain why the answer is correct..." />
                  </div>
                  
                  {/* Collapsible/Extra Grid */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                     <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Year</label>
                        <input value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className={`w-full px-3 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="e.g. 2024" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Exam Type</label>
                        <input value={formData.exam_type} onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })} className={`w-full px-3 py-1.5 text-sm border rounded ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} placeholder="e.g. JAMB" />
                     </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                <button 
                    type="button" 
                    onClick={resetForm} 
                    className={`px-6 py-2.5 rounded-lg font-medium transition ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    form="questionForm"
                    className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-md transition"
                >
                    {editingId ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const QuestionCard = ({ question, isSelected, toggleSelect, onEdit, onDelete, isDarkMode }) => (
    <div className={`group relative p-4 md:p-6 rounded-xl border transition-all ${
        isSelected 
        ? isDarkMode ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50/50' 
        : isDarkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-green-200 hover:shadow-md'
    }`}>
        <div className="flex items-start gap-4">
            <div className="pt-1">
                <input 
                    type="checkbox" 
                    checked={isSelected} 
                    onChange={toggleSelect} 
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" 
                />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                    {question.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                            {question.category}
                        </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {question.subject}
                    </span>
                    {question.topic && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                            {question.topic}
                        </span>
                    )}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        (question.difficulty_level || question.difficulty) === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                        (question.difficulty_level || question.difficulty) === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                        {question.difficulty_level || question.difficulty}
                    </span>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-4 text-sm md:text-base font-medium">
                    <MathText text={question.question_text} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {question.options.map((opt, idx) => {
                        const letter = ['A', 'B', 'C', 'D'][idx];
                        const isCorrect = letter === question.correct_answer;
                        return (
                            <div key={idx} className={`flex items-center gap-3 p-2.5 rounded-lg border text-sm ${
                                isCorrect 
                                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                : isDarkMode ? 'bg-gray-800/50 border-transparent' : 'bg-gray-50 border-transparent'
                            }`}>
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isCorrect ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                    {letter}
                                </span>
                                <span className={isCorrect ? 'font-medium text-green-900 dark:text-green-100' : ''}>
                                    <MathText text={opt} />
                                </span>
                            </div>
                        )
                    })}
                </div>
                
                <div className={`text-sm p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <span className="font-bold text-gray-500 text-xs uppercase mr-2">Explanation:</span>
                    <span className="text-gray-700 dark:text-gray-300"><MathText text={question.explanation || "No explanation provided."} /></span>
                </div>
            </div>

            <div className="flex flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onEdit(question)} 
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition" 
                    title="Edit"
                >
                    <Edit2 size={16} />
                </button>
                <button 
                    onClick={() => onDelete(question.id)} 
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    </div>
);

const EmptyState = ({ navigate, isSearch }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-4">
            {isSearch ? <Search size={32} className="text-gray-400" /> : <Brain size={32} className="text-green-500" />}
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {isSearch ? 'No matching questions found' : 'Question Bank is Empty'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            {isSearch ? 'Try adjusting your filters or search terms.' : 'Start building your library by adding questions manually, importing files, or using AI generation.'}
        </p>
        {!isSearch && (
            <div className="flex gap-3">
                <button onClick={() => navigate('/tutor/questions/generate')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                    Generate with AI
                </button>
            </div>
        )}
    </div>
);

export default Questions;