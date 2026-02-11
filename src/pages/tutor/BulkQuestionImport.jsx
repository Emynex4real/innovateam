import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MathText from '../../components/MathText';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Save, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Info,
  BookOpen,
  Hash,
  Layers,
  BarChart,
  Clipboard
} from 'lucide-react';

const BulkQuestionImport = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [bulkText, setBulkText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [metadata, setMetadata] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium',
    category: ''
  });

  const handleParse = async () => {
    if (!bulkText.trim()) {
      toast.error('Please paste your questions');
      return;
    }
    if (!metadata.subject) {
      toast.error('Please enter a subject');
      return;
    }

    setParsing(true);
    try {
      const response = await tutorialCenterService.parseBulkQuestions({
        text: bulkText,
        ...metadata
      });
      
      if (response.success) {
        setQuestions(response.questions);
        toast.success(`Successfully parsed ${response.questions.length} questions!`);
        // Scroll to top to see results
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Parse error:', error);
      toast.error(error.response?.data?.error || 'Failed to parse questions');
    } finally {
      setParsing(false);
    }
  };

  const handleEdit = (index, field, value) => {
    const updated = [...questions];
    if (field === 'options') {
      updated[index].options = value;
    } else {
      updated[index][field] = value;
    }
    setQuestions(updated);
  };

  const handleRemove = (index) => {
    if (window.confirm('Remove this question?')) {
        setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (questions.length === 0) {
      toast.error('No questions to save');
      return;
    }
    
    // Validate questions before sending
    const invalidQuestions = questions.filter(q => 
      !q.question_text || 
      !Array.isArray(q.options) || 
      q.options.length !== 4 || 
      !q.correct_answer ||
      !q.subject
    );
    
    if (invalidQuestions.length > 0) {
      toast.error(`${invalidQuestions.length} questions have missing required fields. Please review highlighted items.`);
      return;
    }
    
    setSaving(true);
    try {
      const response = await tutorialCenterService.saveBulkQuestions(questions);
      if (response.success) {
        toast.success(`Successfully saved ${response.count} questions!`);
        navigate('/tutor/questions');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/tutor/questions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-800 text-gray-400' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
            }`}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bulk Question Import</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Import questions from text using AI parsing
            </p>
          </div>
        </div>

        {questions.length === 0 ? (
          // --- INPUT PHASE ---
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Configuration */}
            <div className="space-y-6">
                <div className={`p-6 rounded-xl border shadow-sm ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Layers size={20} className="text-green-500" /> Configuration
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                                <BookOpen size={14} /> Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                required
                                value={metadata.subject}
                                onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                                }`}
                                placeholder="e.g., Mathematics"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                                <Hash size={14} /> Topic
                            </label>
                            <input
                                value={metadata.topic}
                                onChange={(e) => setMetadata({ ...metadata, topic: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                                }`}
                                placeholder="e.g., Algebra"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                                <BarChart size={14} /> Category
                            </label>
                            <select
                                value={metadata.category}
                                onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <option value="">Select Category</option>
                                <option value="Science">Science</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Arts">Arts</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1">
                                <Info size={14} /> Difficulty
                            </label>
                            <select
                                value={metadata.difficulty}
                                onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={`p-5 rounded-xl border ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-100'}`}>
                    <h3 className="font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                        <Info size={18} /> How to format
                    </h3>
                    <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                        <li className="flex gap-2"><span className="font-bold">•</span> Paste text directly from Word or PDF.</li>
                        <li className="flex gap-2"><span className="font-bold">•</span> Ensure options are labeled (A, B, C, D).</li>
                        <li className="flex gap-2"><span className="font-bold">•</span> Include "Answer: X" to auto-detect correct option.</li>
                        <li className="flex gap-2"><span className="font-bold">•</span> Include "Explanation:" for auto-detection.</li>
                    </ul>
                </div>
            </div>

            {/* Right Column: Input Area */}
            <div className="lg:col-span-2">
                <div className={`flex flex-col h-full rounded-xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                    <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                        <h2 className="font-bold flex items-center gap-2">
                            <Clipboard size={18} /> Paste Content
                        </h2>
                        <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Markdown / Plain Text</span>
                    </div>
                    
                    <textarea
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        className={`flex-1 w-full p-6 font-mono text-sm resize-none focus:outline-none focus:ring-0 ${
                            isDarkMode ? 'bg-gray-900 text-gray-300 placeholder-gray-600' : 'bg-white text-gray-800 placeholder-gray-400'
                        }`}
                        placeholder={`1. What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Answer: B
Explanation: 2 + 2 equals 4.

2. What is the capital of Nigeria?
...`}
                        style={{ minHeight: '400px' }}
                    />

                    <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                        <button
                            onClick={handleParse}
                            disabled={parsing}
                            className={`w-full py-3.5 rounded-lg font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                                parsing 
                                ? 'bg-gray-500 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:-translate-y-0.5'
                            }`}
                        >
                            {parsing ? (
                                <>
                                    <RefreshCw className="animate-spin" size={20} />
                                    Parsing Questions...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Parse Questions
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          // --- REVIEW PHASE ---
          <div className="space-y-6">
            
            {/* Review Header Toolbar */}
            <div className={`sticky top-4 z-30 p-4 rounded-xl border shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 ${
                isDarkMode ? 'bg-gray-900/95 border-gray-800 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Review Parsed Data</h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Found {questions.length} questions ready for import
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => { 
                            if(window.confirm('Discard current questions and start over?')) {
                                setQuestions([]); setBulkText(''); 
                            }
                        }}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium transition-colors ${
                            isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                        Start Over
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <RefreshCw size={18} className="animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Save All
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Questions List */}
            <div className="grid gap-6">
                {questions.map((q, idx) => (
                    <div 
                        key={idx} 
                        className={`group relative rounded-xl border transition-all ${
                            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'
                        }`}
                    >
                        {/* Card Header */}
                        <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-gray-800 bg-gray-800/30' : 'border-gray-100 bg-gray-50/50'}`}>
                            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'
                            }`}>
                                Question {idx + 1}
                            </span>
                            <button
                                onClick={() => handleRemove(idx)}
                                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Remove Question"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="p-6 grid gap-6">
                            {/* Question Text */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Question Text</label>
                                <div className={`mb-3 p-3 rounded-lg text-sm border ${isDarkMode ? 'bg-gray-950 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                    <MathText text={q.question_text || "Preview..."} />
                                </div>
                                <textarea
                                    value={q.question_text}
                                    onChange={(e) => handleEdit(idx, 'question_text', e.target.value)}
                                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                                        isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                                    }`}
                                    rows="2"
                                />
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                                    <div key={letter}>
                                        <label className={`block text-xs font-bold uppercase mb-1.5 ${
                                            q.correct_answer === letter ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                                        }`}>
                                            Option {letter} {q.correct_answer === letter && '(Correct)'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={q.options[optIdx]}
                                                onChange={(e) => {
                                                    const newOptions = [...q.options];
                                                    newOptions[optIdx] = e.target.value;
                                                    handleEdit(idx, 'options', newOptions);
                                                }}
                                                className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                                                    isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                                                } ${
                                                    q.correct_answer === letter ? 'ring-2 ring-green-500 border-green-500' : ''
                                                }`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Metadata Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Correct Answer</label>
                                    <select
                                        value={q.correct_answer}
                                        onChange={(e) => handleEdit(idx, 'correct_answer', e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        {['A', 'B', 'C', 'D'].map(opt => <option key={opt} value={opt}>Option {opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Difficulty</label>
                                    <select
                                        value={q.difficulty}
                                        onChange={(e) => handleEdit(idx, 'difficulty', e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">Explanation</label>
                                    <input
                                        value={q.explanation}
                                        onChange={(e) => handleEdit(idx, 'explanation', e.target.value)}
                                        placeholder="Optional explanation"
                                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                                            isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkQuestionImport;