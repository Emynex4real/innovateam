import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MathText from '../../components/MathText';
import AIProgressLoader from '../../components/AIProgressLoader';

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
    const totalBatches = Math.ceil(formData.count / 5); // Changed from 10 to 5 (golden number)
    
    // Start at 5%
    setProgress({ completed: formData.count * 0.05, total: formData.count, batch: 1, totalBatches });
    
    // 🧠 SMART PROGRESS SIMULATION (Zeno's Paradox)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const percent = (prev.completed / formData.count) * 100;
        
        // If over 90%, stop and wait for API
        if (percent > 90) {
          return prev;
        }
        
        // Fast at start, slow at end
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
        // 🚀 ZOOM to 100% instantly on success
        setProgress({ completed: formData.count, total: formData.count, batch: totalBatches, totalBatches });
        
        // Small delay to let user see 100%
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
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (questions.length === 0) {
      toast.error('No questions to save');
      return;
    }
    
    const total = questions.length;
    console.log(`💾 Saving ${total} questions...`);
    setSaving(true);
    
    // Show progress toast
    const toastId = toast.loading(`Saving questions... (0/${total})`);
    
    try {
      // Simulate progress updates for better UX
      let progressCount = 0;
      const progressInterval = setInterval(() => {
        progressCount = Math.min(progressCount + Math.ceil(total / 10), total - 1);
        toast.loading(`Saving questions... (${progressCount}/${total})`, { id: toastId });
      }, 500);
      
      const response = await tutorialCenterService.saveBulkQuestions(questions);
      
      clearInterval(progressInterval);
      
      if (response.success) {
        toast.success(`✅ Saved ${response.count} questions successfully!`, { id: toastId });
        console.log(`✅ Successfully saved ${response.count} questions`);
        
        // Small delay to show success message
        setTimeout(() => {
          navigate('/tutor/questions');
        }, 800);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to save questions';
      toast.error(`Failed: ${errorMsg}`, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {generating && (
        <AIProgressLoader 
          completed={progress.completed}
          total={progress.total}
          batch={progress.batch}
          totalBatches={progress.totalBatches}
        />
      )}
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Question Generator</h1>
          <button
            onClick={() => navigate('/tutor/questions')}
            className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition`}
          >
            ← Back
          </button>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6 mb-6`}>
          <form onSubmit={handleGenerate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Subject *</label>
                <input
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Topic *</label>
                <input
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="e.g., Algebra"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={generating}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
            >
              {generating ? 'Generating...' : 'Generate Questions with AI'}
            </button>
          </form>
      </div>

        {questions.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Review & Edit ({questions.length} questions)</h2>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition w-full sm:w-auto"
              >
                {saving ? 'Saving...' : 'Save All Questions'}
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow p-4 md:p-6`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-base md:text-lg">Question {idx + 1}</h3>
                    <button
                      onClick={() => handleRemove(idx)}
                      className="text-red-600 hover:text-red-800 transition text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Question</label>
                    <div className={`mb-2 p-3 rounded border ${isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'} whitespace-pre-wrap`}>
                      <MathText text={q.question_text} />
                    </div>
                    <textarea
                      value={q.question_text}
                      onChange={(e) => handleEdit(idx, 'question_text', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      rows="2"
                    />
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Options</label>
                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                      <div key={letter} className="flex items-center gap-2 mb-2">
                        <span className="font-semibold w-8">{letter}.</span>
                        <input
                          value={q.options[optIdx]}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[optIdx] = e.target.value;
                            handleEdit(idx, 'options', newOptions);
                          }}
                          className={`flex-1 px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Correct Answer</label>
                      <select
                        value={q.correct_answer}
                        onChange={(e) => handleEdit(idx, 'correct_answer', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Difficulty</label>
                      <select
                        value={q.difficulty}
                        onChange={(e) => handleEdit(idx, 'difficulty', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Explanation</label>
                    <div className={`mb-2 p-3 rounded border ${isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'} whitespace-pre-wrap`}>
                      <MathText text={q.explanation} />
                    </div>
                    <textarea
                      value={q.explanation}
                      onChange={(e) => handleEdit(idx, 'explanation', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      rows="2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIGenerator;
