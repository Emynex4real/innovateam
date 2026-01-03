import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import MathText from '../../components/MathText';

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
        toast.success(`Parsed ${response.questions.length} questions!`);
      }
    } catch (error) {
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
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (questions.length === 0) {
      toast.error('No questions to save');
      return;
    }
    setSaving(true);
    try {
      const response = await tutorialCenterService.saveBulkQuestions(questions);
      if (response.success) {
        toast.success(`Saved ${response.count} questions`);
        navigate('/tutor/questions');
      }
    } catch (error) {
      toast.error('Failed to save questions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📋 Bulk Question Import
          </h1>
          <button
            onClick={() => navigate('/tutor/questions')}
            className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition`}
          >
            ← Back
          </button>
        </div>

        {questions.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-6`}>
            <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border-2 rounded-lg p-4 mb-6`}>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span>💡</span> How to use:
              </h3>
              <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• Paste your questions with answers in any format</li>
                <li>• AI will automatically detect questions, options, and correct answers</li>
                <li>• Review and edit before saving</li>
                <li>• Supports numbered questions, lettered options (A-D), and various formats</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Subject *
                </label>
                <input
                  required
                  value={metadata.subject}
                  onChange={(e) => setMetadata({ ...metadata, subject: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Topic
                </label>
                <input
                  value={metadata.topic}
                  onChange={(e) => setMetadata({ ...metadata, topic: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="e.g., Algebra"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
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
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Difficulty
                </label>
                <select
                  value={metadata.difficulty}
                  onChange={(e) => setMetadata({ ...metadata, difficulty: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Paste Questions & Answers
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg font-mono text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                rows="15"
                placeholder={`Example format:

1. What is 2 + 2?
A. 3
B. 4
C. 5
D. 6
Answer: B
Explanation: 2 + 2 equals 4

2. What is the capital of Nigeria?
A. Lagos
B. Abuja
C. Kano
D. Port Harcourt
Answer: B
Explanation: Abuja is the capital city of Nigeria`}
              />
            </div>

            <button
              onClick={handleParse}
              disabled={parsing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition font-semibold"
            >
              {parsing ? '🤖 AI Parsing Questions...' : '🚀 Parse with AI'}
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Review & Edit ({questions.length} questions)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setQuestions([]); setBulkText(''); }}
                  className={`px-4 py-2 rounded-lg transition ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  Start Over
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {saving ? 'Saving...' : 'Save All Questions'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow p-6`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">Question {idx + 1}</h3>
                    <button
                      onClick={() => handleRemove(idx)}
                      className="text-red-600 hover:text-red-800 transition text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Question
                    </label>
                    <div className={`mb-2 p-3 rounded border ${isDarkMode ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
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
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Options
                    </label>
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

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Correct Answer
                      </label>
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
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Difficulty
                      </label>
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
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Explanation
                    </label>
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

export default BulkQuestionImport;
