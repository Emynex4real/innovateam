import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { AIQuestionsService } from '../../services/aiQuestions.service';
import { Plus, Trash2, Edit, Eye, EyeOff, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const AIQuestions = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Generate form state
  const [generateForm, setGenerateForm] = useState({
    text: '',
    questionCount: 10,
    difficulty: 'medium',
    questionTypes: ['multiple-choice'],
    bankName: '',
    subject: ''
  });

  useEffect(() => {
    loadBanks();
    loadStats();
  }, []);

  const loadBanks = async () => {
    try {
      const result = await AIQuestionsService.getQuestionBanks();
      if (result.success) setBanks(result.data);
    } catch (error) {
      console.error('Failed to load question banks:', error);
    }
  };

  const loadStats = async () => {
    try {
      const result = await AIQuestionsService.getQuestionStats();
      if (result.success) setStats(result.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadQuestions = async (bankId) => {
    try {
      setLoading(true);
      const result = await AIQuestionsService.getQuestionsByBank(bankId);
      if (result.success) {
        setQuestions(result.data);
        setSelectedBank(bankId);
      }
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!generateForm.text || generateForm.text.length < 10) {
      toast.error('Please provide text content (minimum 10 characters)');
      return;
    }

    try {
      setLoading(true);
      const result = await AIQuestionsService.generateQuestions(generateForm);
      if (result.success) {
        toast.success(`Generated ${result.questions.length} questions successfully!`);
        setGenerateForm({ ...generateForm, text: '' });
        loadBanks();
        loadStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBank = async (bankId) => {
    if (!window.confirm('Delete this question bank? All questions will be removed.')) return;
    
    try {
      await AIQuestionsService.deleteQuestionBank(bankId);
      toast.success('Question bank deleted');
      loadBanks();
      loadStats();
      if (selectedBank === bankId) {
        setSelectedBank(null);
        setQuestions([]);
      }
    } catch (error) {
      toast.error('Failed to delete question bank');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    
    try {
      await AIQuestionsService.deleteQuestion(questionId);
      toast.success('Question deleted');
      loadQuestions(selectedBank);
      loadStats();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      toast.error('No questions selected');
      return;
    }
    if (!window.confirm(`Delete ${selectedQuestions.length} selected questions?`)) return;

    try {
      await AIQuestionsService.bulkDeleteQuestions(selectedQuestions);
      toast.success(`${selectedQuestions.length} questions deleted`);
      setSelectedQuestions([]);
      loadQuestions(selectedBank);
      loadStats();
    } catch (error) {
      toast.error('Failed to delete questions');
    }
  };

  const handleToggleStatus = async (questionId) => {
    try {
      await AIQuestionsService.toggleQuestionStatus(questionId);
      toast.success('Question status updated');
      loadQuestions(selectedBank);
    } catch (error) {
      toast.error('Failed to update question status');
    }
  };

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const renderGenerateTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Questions from Text</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <Label>Text Content</Label>
              <Textarea
                value={generateForm.text}
                onChange={(e) => setGenerateForm({ ...generateForm, text: e.target.value })}
                placeholder="Paste your educational content here..."
                rows={8}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={generateForm.bankName}
                  onChange={(e) => setGenerateForm({ ...generateForm, bankName: e.target.value })}
                  placeholder="e.g., Biology Chapter 1"
                  required
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  value={generateForm.subject}
                  onChange={(e) => setGenerateForm({ ...generateForm, subject: e.target.value })}
                  placeholder="e.g., Biology"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Question Count</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={generateForm.questionCount}
                  onChange={(e) => setGenerateForm({ ...generateForm, questionCount: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Difficulty</Label>
                <select 
                  value={generateForm.difficulty} 
                  onChange={(e) => setGenerateForm({ ...generateForm, difficulty: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <Label>Question Types</Label>
                <select 
                  value={generateForm.questionTypes[0]} 
                  onChange={(e) => setGenerateForm({ ...generateForm, questionTypes: [e.target.value] })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="fill-in-blank">Fill in Blank</option>
                  <option value="flashcard">Flashcard</option>
                </select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Generate Questions'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalBanks}</div>
              <div className="text-sm text-gray-500">Question Banks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-500">Total Questions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <div className="text-sm text-gray-500">Times Used</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {stats.totalUsage > 0 ? Math.round((stats.correctAnswers / stats.totalUsage) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderBanksTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Question Banks</h2>
        <Button onClick={loadBanks}>Refresh</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banks.map((bank) => (
          <Card key={bank.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{bank.name}</CardTitle>
                  <p className="text-sm text-gray-500">{bank.subject}</p>
                </div>
                <Badge variant={bank.is_active ? 'default' : 'secondary'}>
                  {bank.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Questions:</span>
                  <span className="font-semibold">{bank.questionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Difficulty:</span>
                  <Badge variant="outline">{bank.difficulty}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Created by:</span>
                  <span className="text-gray-600">{bank.creatorName}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => loadQuestions(bank.id)} className="flex-1">
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteBank(bank.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {banks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No question banks yet. Generate some questions to get started!
        </div>
      )}
    </div>
  );

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Questions</h2>
        <div className="flex gap-2">
          {selectedQuestions.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete Selected ({selectedQuestions.length})
            </Button>
          )}
          {selectedBank && <Button onClick={() => loadQuestions(selectedBank)}>Refresh</Button>}
        </div>
      </div>

      {!selectedBank ? (
        <div className="text-center py-12 text-gray-500">
          Select a question bank from the Banks tab to view questions
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No questions in this bank
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(q.id)}
                    onChange={() => toggleQuestionSelection(q.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <Badge>{q.type}</Badge>
                        <Badge variant="outline">{q.difficulty}</Badge>
                        <Badge variant={q.is_active ? 'default' : 'secondary'}>
                          {q.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(q.id)}>
                          {q.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteQuestion(q.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-semibold mb-2">{idx + 1}. {q.question}</p>
                    {q.options && (
                      <div className="ml-4 space-y-1 text-sm">
                        {(() => {
                          try {
                            const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                            return Array.isArray(options) ? options.map((opt, i) => (
                              <div key={i} className={opt === q.correct_answer ? 'text-green-600 font-semibold' : ''}>
                                {opt} {opt === q.correct_answer && '✓'}
                              </div>
                            )) : null;
                          } catch (e) {
                            return <div className="text-red-500">Invalid options format</div>;
                          }
                        })()}
                      </div>
                    )}
                    {!q.options && (
                      <div className="ml-4 text-sm">
                        <span className="font-semibold text-green-600">Answer: {q.correct_answer}</span>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Question Management</h1>
      </div>

      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'generate' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('generate')}
        >
          Generate
        </Button>
        <Button
          variant={activeTab === 'banks' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('banks')}
        >
          Banks ({banks.length})
        </Button>
        <Button
          variant={activeTab === 'questions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('questions')}
        >
          Questions {selectedBank && `(${questions.length})`}
        </Button>
      </div>

      {activeTab === 'generate' && renderGenerateTab()}
      {activeTab === 'banks' && renderBanksTab()}
      {activeTab === 'questions' && renderQuestionsTab()}
    </div>
  );
};

export default AIQuestions;
