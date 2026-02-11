import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MathText from '../../components/MathText';
import AIProgressLoader from '../../components/AIProgressLoader';
import { 
  ArrowLeft, 
  Wand2, 
  Sparkles, 
  BookOpen, 
  Hash, 
  BarChart, 
  Layers, 
  Save, 
  Trash2, 
  RefreshCw, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AIGenerator = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    difficulty: 'medium',
    count: 5
  });
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, batch: 0, totalBatches: 0 });

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.topic) {
      toast.error('Please fill in both subject and topic');
      return;
    }
    
    if (formData.count < 1 || formData.count > 60) {
      toast.error('Number of questions must be between 1 and 60');
      return;
    }
    
    setGenerating(true);
    const totalBatches = Math.ceil(formData.count / 5);
    
    setProgress({ completed: formData.count * 0.05, total: formData.count, batch: 1, totalBatches });
    
    // Smart progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const percent = (prev.completed / formData.count) * 100;
        if (percent > 90) return prev;
        
        const increment = percent < 50 ? 2 : percent < 80 ? 1 : 0.5;
        const newCompleted = Math.min(prev.completed + increment, formData.count * 0.95);
        
        return {
          ...prev,
          completed: newCompleted,
          batch: Math.min(Math.ceil((newCompleted / formData.count) * totalBatches), totalBatches)
        };
      });
    }, 800);
    
    try {
      const response = await tutorialCenterService.generateQuestionsAI(formData);
      clearInterval(progressInterval);
      
      if (response.success && response.questions?.length > 0) {
        setProgress({ completed: formData.count, total: formData.count, batch: totalBatches, totalBatches });
        
        setTimeout(() => {
          setQuestions(response.questions);
          toast.success(`Generated ${response.questions.length} questions`);
          setGenerating(false);
        }, 600);
      } else {
        toast.error('No questions were generated. Please try again.');
        setGenerating(false);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('❌ Generation error:', error);
      toast.error(error.response?.data?.error || 'Failed to generate questions');
      setGenerating(false);
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
    
    setSaving(true);
    const toastId = toast.loading(`Saving questions...`);
    
    try {
      const response = await tutorialCenterService.saveBulkQuestions(questions);
      if (response.success) {
        toast.success(`Successfully saved ${response.count} questions!`, { id: toastId });
        setTimeout(() => navigate('/tutor/questions'), 800);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save questions', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* AI Loader Overlay */}
      {generating && (
        <AIProgressLoader 
          completed={progress.completed}
          total={progress.total}
          batch={progress.batch}
          totalBatches={progress.totalBatches}
        />
      )}
      
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
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="text-emerald-500" size={24} /> AI Question Generator
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Automatically generate high-quality questions using AI
            </p>
          </div>
        </div>

        {questions.length === 0 ? (
          // --- GENERATION FORM ---
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-2xl border shadow-xl overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
              
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center">
                <div className="mx-auto bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Wand2 size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">What should we create?</h2>
                <p className="text-emerald-100">Define the topic and let our AI do the heavy lifting.</p>
              </div>

              <div className="p-8">
                <form onSubmit={handleGenerate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Subject */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <BookOpen size={16} /> Subject
                      </label>
                      <input
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                        }`}
                        placeholder="e.g. Physics"
                      />
                    </div>

                    {/* Topic */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Hash size={16} /> Topic
                      </label>
                      <input
                        required
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                        }`}
                        placeholder="e.g. Thermodynamics"
                      />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <BarChart size={16} /> Difficulty
                      </label>
                      <div className="relative">
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl border appearance-none transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    {/* Count */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Layers size={16} /> Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={formData.count}
                        onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                        className={`w-full px-4 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                            isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={generating}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>Generatng Content...</>
                      ) : (
                        <>
                          <Sparkles size={20} /> Generate Questions
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Powered by AI. Results may require review.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          // --- REVIEW PHASE ---
          <div className="space-y-6">
            
            {/* Sticky Action Bar */}
            <div className={`sticky top-4 z-30 p-4 rounded-xl border shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 ${
                isDarkMode ? 'bg-gray-900/95 border-gray-800 backdrop-blur' : 'bg-white/95 border-gray-200 backdrop-blur'
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Review Generated Content</h2>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {questions.length} questions ready for saving
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => { 
                            if(window.confirm('Discard generated questions and start over?')) {
                                setQuestions([]);
                            }
                        }}
                        className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                            isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    >
                        <RefreshCw size={16} /> Discard
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {saving ? 'Saving...' : (
                            <>
                                <Save size={18} /> Save to Bank
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
                            isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
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
                                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
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
                                            className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
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

export default AIGenerator;