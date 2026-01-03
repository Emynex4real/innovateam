import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { AIQuestionsService } from '../../services/aiQuestions.service';
import { Trash2, Eye, EyeOff, AlertCircle, BookOpen, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';
import { diagnoseQuestionBank } from '../../utils/questionBankDiagnostic';

// --- MATH RENDERING IMPORTS ---
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const AIQuestions = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Toggle between 'topic' (AI Simulator) and 'text' (Comprehension)
  const [generationMode, setGenerationMode] = useState('topic');

  const [generateForm, setGenerateForm] = useState({
    subject: '',      
    topic: '',        
    bankName: '',     
    text: '',         
    questionCount: 5, // Default to Safe Mode
    difficulty: 'hard',
    questionTypes: ['multiple-choice'],
  });

  useEffect(() => {
    loadBanks();
    loadStats();
  }, []);

  // --- DATA LOADING ---
  const loadBanks = async () => {
    try {
      setLoading(true);
      const result = await AIQuestionsService.getQuestionBanks();
      if (result.success) {
        setBanks(result.data || []);
      }
    } catch (error) {
      toast.error('Failed to load question banks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await AIQuestionsService.getQuestionStats();
      if (result.success) setStats(result.data);
    } catch (error) {
      console.error('Stats load failed', error);
    }
  };

  const loadQuestions = async (bankId) => {
    try {
      setLoading(true);
      const result = await AIQuestionsService.getQuestionsByBank(bankId);
      if (result.success) {
        setQuestions(result.data);
        setSelectedBank(bankId);
        setActiveTab('questions'); 
      }
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION HANDLERS ---

  const handleGenerate = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (!generateForm.subject || !generateForm.bankName) {
      toast.error('Subject and Bank Name are required.');
      return;
    }

    if (generationMode === 'topic' && !generateForm.topic) {
      toast.error('Please specify a Topic.');
      return;
    }

    if (generationMode === 'text' && (!generateForm.text || generateForm.text.length < 50)) {
      toast.error('Please provide sufficient text content (min 50 chars).');
      return;
    }

    // 2. Payload
    const payload = {
      ...generateForm,
      text: generationMode === 'topic' ? null : generateForm.text,
      questionCount: parseInt(generateForm.questionCount) || 5
    };

    try {
      setLoading(true);
      
      // Calculate estimated time (roughly 1 minute per 10 questions)
      const estimatedMinutes = Math.ceil(payload.questionCount / 10);
      const loadingToast = toast.loading(
        `AI is generating ${payload.questionCount} questions. Estimated time: ${estimatedMinutes} minute${estimatedMinutes > 1 ? 's' : ''}. Please wait...`
      );
      
      // 3. EXTENDED TIMEOUT (5 Minutes)
      const result = await Promise.race([
        AIQuestionsService.generateQuestions(payload),
        new Promise((_, reject) => setTimeout(() => reject(new Error('AI took too long (Timeout).')), 300000))
      ]);
      
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(`Success! Generated ${result.questions.length} questions.`);
        // Reset form but keep subject
        setGenerateForm({ ...generateForm, text: '', topic: '' }); 
        loadBanks();
        loadStats();
        if (result.bankId) loadQuestions(result.bankId);
      }
    } catch (error) {
      toast.dismiss();
      console.error('Generate Error:', error);
      toast.error(error.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBank = async (bankId, e) => {
    e.stopPropagation(); 
    if (!window.confirm('Delete this bank and all its questions?')) return;
    
    try {
      await AIQuestionsService.deleteQuestionBank(bankId);
      toast.success('Bank deleted');
      loadBanks();
      loadStats();
      if (selectedBank === bankId) {
        setSelectedBank(null);
        setQuestions([]);
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // --- RENDER HELPERS ---

  const renderGenerateTab = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          type="button"
          onClick={() => setGenerationMode('topic')}
          className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
            generationMode === 'topic' 
              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200' 
              : 'hover:bg-gray-50'
          }`}
        >
          <BrainCircuit className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">AI Simulator (Topic)</div>
            <div className="text-xs opacity-70">Best for Science & Math. AI creates new questions.</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setGenerationMode('text')}
          className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
            generationMode === 'text' 
              ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200' 
              : 'hover:bg-gray-50'
          }`}
        >
          <BookOpen className="w-6 h-6" />
          <div className="text-left">
            <div className="font-semibold">Comprehension (Text)</div>
            <div className="text-xs opacity-70">Best for English Passages. Paste text to analyze.</div>
          </div>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {generationMode === 'topic' ? 'Generate from Topic' : 'Generate from Text'}
          </CardTitle>
          <CardDescription>
            Configure your exam parameters below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Subject <span className="text-red-500">*</span></Label>
                <Input
                  value={generateForm.subject}
                  onChange={(e) => setGenerateForm({ ...generateForm, subject: e.target.value })}
                  placeholder="e.g. Mathematics"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Topic <span className="text-red-500">*</span></Label>
                <Input
                  value={generateForm.topic}
                  onChange={(e) => setGenerateForm({ 
                    ...generateForm, 
                    topic: e.target.value,
                    bankName: !generateForm.bankName ? `${e.target.value} Quiz` : generateForm.bankName
                  })}
                  placeholder="e.g. Calculus"
                  className="mt-1"
                />
              </div>
            </div>

            {generationMode === 'text' && (
              <div className="animate-in fade-in zoom-in duration-300">
                <Label>Source Text <span className="text-red-500">*</span></Label>
                <Textarea
                  value={generateForm.text}
                  onChange={(e) => setGenerateForm({ ...generateForm, text: e.target.value })}
                  placeholder="Paste passage here..."
                  rows={8}
                  className="mt-1"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Bank Name</Label>
                <Input
                  value={generateForm.bankName}
                  onChange={(e) => setGenerateForm({ ...generateForm, bankName: e.target.value })}
                  placeholder="Set Name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Quantity</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={generateForm.questionCount}
                  onChange={(e) => setGenerateForm({ ...generateForm, questionCount: e.target.value })}
                >
                  <option value="5">5 Questions (Free Tier Safe)</option>
                  <option value="15">15 Questions (1 Batch)</option>
                  <option value="30">30 Questions (2 Batches)</option>
                  <option value="45">45 Questions (Standard)</option>
                  <option value="60">60 Questions (Exam Mode)</option>
                </select>
              </div>

              <div>
                <Label>Difficulty</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={generateForm.difficulty}
                  onChange={(e) => setGenerateForm({ ...generateForm, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <Button size="lg" type="submit" disabled={loading} className="w-full font-semibold">
              {loading ? <span className="animate-spin mr-2">⏳</span> : null}
              {loading ? 'Generating...' : `Generate ${generateForm.questionCount} Questions`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-50">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalBanks}</div>
              <div className="text-xs text-gray-500 uppercase">Banks</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalQuestions}</div>
              <div className="text-xs text-gray-500 uppercase">Questions</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderQuestionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-bold">
            {banks.find(b => b.id === selectedBank)?.name || 'All Questions'}
          </h2>
          <p className="text-sm text-gray-500">{questions.length} Questions loaded</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={() => setActiveTab('banks')}>Back</Button>
           <Button onClick={() => loadQuestions(selectedBank)}>Refresh</Button>
        </div>
      </div>

      <div className="grid gap-6">
        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No questions found. Select a bank to view questions.
          </div>
        ) : (
          questions.map((q, idx) => (
            <Card key={q.id || idx} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="border-l-4 border-blue-500">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 items-center">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded">
                        Q{idx + 1}
                      </span>
                      <Badge variant="outline">{q.difficulty}</Badge>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* --- QUESTION TEXT WITH LATEX --- */}
                  <div className="text-lg font-medium mb-4 text-gray-800">
                    <Latex>{q.question}</Latex>
                  </div>

                  {/* --- OPTIONS WITH LATEX --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 pl-4 border-l-2 border-gray-100">
                    {(() => {
                      let parsedOptions = [];
                      try {
                        parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                      } catch (e) { parsedOptions = []; }

                      if (!Array.isArray(parsedOptions)) return <div className="text-red-500 text-sm">Error options</div>;

                      return parsedOptions.map((opt, i) => {
                        const isCorrect = opt.trim() === q.correct_answer?.trim();
                        return (
                          <div 
                            key={i} 
                            className={`p-3 rounded-md text-sm border ${
                              isCorrect 
                                ? 'bg-green-50 border-green-200 text-green-800 font-medium' 
                                : 'bg-gray-50 border-gray-100 text-gray-600'
                            }`}
                          >
                            <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                            {/* Render Option Math */}
                            <Latex>{opt}</Latex>
                            {isCorrect && <span className="ml-2">✅</span>}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* --- EXPLANATION WITH LATEX --- */}
                  {q.explanation && (
                    <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 flex items-start gap-2">
                      <BrainCircuit className="w-4 h-4 mt-1 shrink-0" />
                      <div>
                        <span className="font-bold block text-xs uppercase tracking-wide opacity-70">Explanation</span>
                        <Latex>{q.explanation}</Latex>
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Question Studio</h1>
          <p className="text-gray-500">Generate, manage, and distribute JAMB-standard questions.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => diagnoseQuestionBank()}>
             <AlertCircle className="w-4 h-4 mr-2" /> System Check
           </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b pb-1 overflow-x-auto">
        {['generate', 'banks', 'questions'].map(tab => (
           <button
             key={tab}
             onClick={() => setActiveTab(tab)}
             className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
               activeTab === tab ? 'bg-primary text-primary-foreground' : 'text-gray-600 hover:bg-gray-100'
             }`}
           >
             {tab.charAt(0).toUpperCase() + tab.slice(1)}
           </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'banks' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {loading && <div className="col-span-full text-center py-10">Loading banks...</div>}
             {!loading && banks.map(bank => (
                <Card key={bank.id} className="hover:shadow-md transition-all cursor-pointer group" onClick={() => loadQuestions(bank.id)}>
                   <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                         <Badge>{bank.subject}</Badge>
                         <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-500" onClick={(e) => handleDeleteBank(bank.id, e)}>
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                      <CardTitle className="text-lg mt-2 truncate">{bank.name}</CardTitle>
                   </CardHeader>
                   <CardContent>
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                         <span>{bank.questionCount || 0} Questions</span>
                         <span className="capitalize">{bank.difficulty}</span>
                      </div>
                   </CardContent>
                </Card>
             ))}
           </div>
        )}
        {activeTab === 'questions' && renderQuestionsTab()}
      </div>
    </div>
  );
};

export default AIQuestions;