import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MathText from '../../components/MathText';
import TagInput from '../../components/TagInput';

const Questions = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [questions, setQuestions] = useState([]);
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
    difficulty_level: 'medium',
    subcategory: '',
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
      const response = await tutorialCenterService.getQuestions(filter);
      if (response.success) {
        setQuestions(response.questions);
      }
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
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
      difficulty_level: 'medium',
      subcategory: '',
      year: '',
      exam_type: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className={`flex justify-center p-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/tutor')}
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition`}
            >
              ← Back
            </button>
            <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Question Bank</h1>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/tutor/questions/bulk-import')}
              className="flex-1 sm:flex-none bg-purple-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm md:text-base"
            >
              📋 Bulk Import
            </button>
            <button
              onClick={() => navigate('/tutor/questions/generate')}
              className="flex-1 sm:flex-none bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm md:text-base"
            >
              AI Generate
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 sm:flex-none bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm md:text-base"
            >
              Add Question
            </button>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 mb-6`}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="">All Categories</option>
              <option value="Science">Science</option>
              <option value="Commercial">Commercial</option>
              <option value="Arts">Arts</option>
              <option value="General">General</option>
            </select>
            <input
              type="text"
              placeholder="Filter by subject..."
              value={filter.subject}
              onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
              className={`flex-1 px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
            />
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
              className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <h3 className="text-lg md:text-xl font-bold mb-4">{editingId ? 'Edit' : 'Add'} Question</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Question</label>
                  <textarea
                    required
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    rows="3"
                  />
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Options</label>
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <input
                      key={letter}
                      required
                      placeholder={`Option ${letter}`}
                      value={formData.options[idx]}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg mb-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Correct Answer</label>
                    <select
                      value={formData.correct_answer}
                      onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
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
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">Select Category</option>
                      <option value="Science">Science</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Arts">Arts</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Subject</label>
                    <input
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Topic</label>
                  <input
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Explanation</label>
                  <textarea
                    required
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    rows="2"
                  />
                </div>
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Tags</label>
                  <TagInput
                    tags={formData.tags}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                    suggestions={tagSuggestions}
                    placeholder="Add tags (e.g., algebra, jamb-2024)..."
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Press Enter or comma to add tags</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Year (Optional)</label>
                    <input
                      placeholder="e.g., 2024"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Exam Type (Optional)</label>
                    <input
                      placeholder="e.g., JAMB, WAEC"
                      value={formData.exam_type}
                      onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={resetForm} className={`flex-1 py-2 rounded-lg transition ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow p-4 md:p-6`}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {q.category && <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded font-semibold">{q.category}</span>}
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">{q.subject}</span>
                    {q.topic && <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>{q.topic}</span>}
                    <span className={`px-2 py-1 text-xs rounded ${
                      (q.difficulty_level || q.difficulty) === 'easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                      (q.difficulty_level || q.difficulty) === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}>{q.difficulty_level || q.difficulty}</span>
                    {q.tags && q.tags.length > 0 && q.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 text-xs rounded">#{tag}</span>
                    ))}
                  </div>
                  <p className="font-medium mb-3 text-sm md:text-base"><MathText text={q.question_text} /></p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={`p-2 rounded text-sm ${
                        ['A', 'B', 'C', 'D'][idx] === q.correct_answer 
                          ? 'bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-700' 
                          : isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <span className="font-semibold">{['A', 'B', 'C', 'D'][idx]}.</span> <MathText text={opt} />
                      </div>
                    ))}
                  </div>
                  <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}><strong>Explanation:</strong> <MathText text={q.explanation} /></p>
                </div>
                <div className="flex md:flex-col gap-2 w-full md:w-auto">
                  <button onClick={() => handleEdit(q)} className="flex-1 md:flex-none text-blue-600 hover:text-blue-800 transition text-sm">Edit</button>
                  <button onClick={() => handleDelete(q.id)} className="flex-1 md:flex-none text-red-600 hover:text-red-800 transition text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No questions yet. Add your first question or use AI to generate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
