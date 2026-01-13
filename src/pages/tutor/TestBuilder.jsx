import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

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
        // Group questions by subject and topic
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
    const subjectQuestions = Object.values(groupedQuestions[subject])
      .flat()
      .map(q => q.id);
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
    if (selectedQuestions.length === 0) {
      toast.error('Select at least one question');
      return;
    }
    setSaving(true);
    try {
      // Step 1: Create the test
      const response = await tutorialCenterService.createQuestionSet(formData);
      if (response.success) {
        // Step 2: Add questions to the test
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
    return <div className={`flex justify-center p-8 min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create Test</h1>
          <button onClick={() => navigate('/tutor/tests')} className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} transition`}>
            ← Back
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6 mb-6`}>
            <h2 className="text-lg md:text-xl font-bold mb-4">Test Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Test Title *</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  placeholder="e.g., Mathematics Mid-Term Test"
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  rows="2"
                  placeholder="Brief description of the test"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Time Limit (minutes) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Passing Score (%) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={formData.passing_score}
                  onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="private">🔒 Private (Center members only)</option>
                  <option value="public">🌍 Public (Anyone can access)</option>
                </select>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formData.visibility === 'public' ? 'This test will be visible to all students' : 'Only students enrolled in your center can access'}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.show_answers}
                    onChange={(e) => setFormData({ ...formData, show_answers: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Show answers to students after submission</span>
                </label>
              </div>
            </div>
          </div>

          {/* Attempt Limits Section */}
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6 mb-6`}>
            <h2 className="text-lg md:text-xl font-bold mb-4">🎯 Attempt Limits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Max Attempts</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="1"
                  max="10"
                  value={formData.max_attempts}
                  onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 1 })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Number of times a student can attempt this test (1-10)
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Cooldown Period (hours)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="168"
                  value={formData.cooldown_hours}
                  onChange={(e) => setFormData({ ...formData, cooldown_hours: parseInt(e.target.value) || 0 })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Hours to wait between attempts (0 = no cooldown)
                </p>
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Score Policy</label>
                <select
                  value={formData.score_policy}
                  onChange={(e) => setFormData({ ...formData, score_policy: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                >
                  <option value="best">🏆 Best Score (Highest score counts)</option>
                  <option value="average">📊 Average Score (Average of all attempts)</option>
                  <option value="last">🔄 Last Attempt (Most recent score)</option>
                  <option value="first">1️⃣ First Attempt (Initial score only)</option>
                </select>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  How to calculate the final score when multiple attempts are made
                </p>
              </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6 mb-6`}>
            <h2 className="text-lg md:text-xl font-bold mb-4">📅 Scheduling (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_end}
                  onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.auto_activate}
                  onChange={(e) => setFormData({ ...formData, auto_activate: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Auto-activate at start time</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.auto_deactivate}
                  onChange={(e) => setFormData({ ...formData, auto_deactivate: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Auto-deactivate at end time</span>
              </label>
            </div>

            <div className="border-t pt-4 mt-4">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>🔄 Recurring Test</span>
              </label>

              {formData.is_recurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Repeat</label>
                    <select
                      value={formData.recurrence_pattern}
                      onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  {formData.recurrence_pattern === 'weekly' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Days</label>
                      <div className="flex flex-wrap gap-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                          <label key={day} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={formData.recurrence_days.includes(idx + 1)}
                              onChange={(e) => {
                                const days = e.target.checked
                                  ? [...formData.recurrence_days, idx + 1]
                                  : formData.recurrence_days.filter(d => d !== idx + 1);
                                setFormData({ ...formData, recurrence_days: days.sort() });
                              }}
                              className="w-3 h-3"
                            />
                            <span className="text-xs">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg p-4 md:p-6 mb-6`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-lg md:text-xl font-bold">Select Questions ({selectedQuestions.length} selected)</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuestions(questions.map(q => q.id))}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQuestions([])}
                  className="text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <input
                type="text"
                placeholder="🔍 Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className={`px-4 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {questions.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No questions available. <button onClick={() => navigate('/tutor/ai-generator')} className="text-blue-600 hover:underline">Generate with AI</button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {Object.keys(groupedQuestions).map(subject => {
                  const subjectQuestions = Object.values(groupedQuestions[subject]).flat();
                  const selectedInSubject = subjectQuestions.filter(q => selectedQuestions.includes(q.id)).length;
                  
                  return (
                    <div key={subject} className={`border rounded-lg ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      {/* Subject Header */}
                      <div
                        className={`flex items-center justify-between p-3 cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                        onClick={() => toggleSubject(subject)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{expandedSubjects[subject] ? '📂' : '📁'}</span>
                          <span className="font-semibold">{subject}</span>
                          <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            {selectedInSubject}/{subjectQuestions.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); selectAllInSubject(subject); }}
                          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {selectedInSubject === subjectQuestions.length ? 'Deselect' : 'Select'} All
                        </button>
                      </div>

                      {/* Topics */}
                      {expandedSubjects[subject] && (
                        <div className="border-t">
                          {Object.keys(groupedQuestions[subject]).map(topic => {
                            const topicQuestions = groupedQuestions[subject][topic];
                            const filteredQuestions = topicQuestions.filter(q => {
                              const matchesSearch = !searchTerm || q.question_text.toLowerCase().includes(searchTerm.toLowerCase());
                              const matchesDifficulty = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
                              return matchesSearch && matchesDifficulty;
                            });
                            
                            if (filteredQuestions.length === 0) return null;
                            
                            const selectedInTopic = filteredQuestions.filter(q => selectedQuestions.includes(q.id)).length;
                            const topicKey = `${subject}-${topic}`;
                            
                            return (
                              <div key={topic} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                {/* Topic Header */}
                                <div
                                  className={`flex items-center justify-between p-3 pl-8 cursor-pointer ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                                  onClick={() => toggleTopic(subject, topic)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{expandedTopics[topicKey] ? '▼' : '▶'}</span>
                                    <span className="font-medium text-sm">{topic}</span>
                                    <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                      {selectedInTopic}/{filteredQuestions.length}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); selectAllInTopic(subject, topic); }}
                                    className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                  >
                                    {selectedInTopic === filteredQuestions.length ? 'Deselect' : 'Select'} Topic
                                  </button>
                                </div>

                                {/* Questions */}
                                {expandedTopics[topicKey] && (
                                  <div className="space-y-2 p-3 pl-12">
                                    {filteredQuestions.map((q) => (
                                      <div
                                        key={q.id}
                                        onClick={() => toggleQuestion(q.id)}
                                        className={`p-3 border rounded-lg cursor-pointer transition ${
                                          selectedQuestions.includes(q.id)
                                            ? 'border-blue-500 ' + (isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50')
                                            : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <input
                                            type="checkbox"
                                            checked={selectedQuestions.includes(q.id)}
                                            onChange={() => {}}
                                            className="mt-1"
                                          />
                                          <div className="flex-1">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                              <span className={`px-2 py-1 text-xs rounded ${
                                                q.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                                q.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                              }`}>{q.difficulty}</span>
                                            </div>
                                            <p className="font-medium text-sm">{q.question_text.substring(0, 100)}{q.question_text.length > 100 ? '...' : ''}</p>
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
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving || selectedQuestions.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              {saving ? 'Creating...' : `Create Test (${selectedQuestions.length} questions)`}
            </button>
            <button
              type="button"
              onClick={() => navigate('/tutor/tests')}
              className={`px-6 py-3 rounded-lg transition ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestBuilder;
