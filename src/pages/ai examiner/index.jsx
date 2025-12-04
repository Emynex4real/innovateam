import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import aiExaminerService from '../../services/aiExaminer.service';
import { useWallet } from '../../contexts/WalletContext';
import { 
  Upload, FileText, Clock, CheckCircle, Trophy, 
  RotateCcw, Brain, ChevronRight, Loader2, AlertCircle, XCircle, 
  Sparkles, GraduationCap, ChevronLeft, Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';

const AIExaminer = () => {
  const { walletBalance, addTransaction } = useWallet();
  
  // Steps: 0=Input, 1=Config, 2=Exam, 3=Results
  const [step, setStep] = useState(0);
  const [inputType, setInputType] = useState('file'); // 'file' or 'text'
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  // Data State
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  
  // Config State
  const [examConfig, setExamConfig] = useState({
    questionCount: 10,
    difficulty: 'medium',
    duration: 30,
    questionTypes: ['multiple-choice']
  });
  
  // Exam State
  const [examId, setExamId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);

  // Timer Logic
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, timeLeft]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;

  // RESET FUNCTION (Fixes the retake bug)
  const resetExamSession = () => {
    setStep(0);
    setFile(null);
    setExtractedText('');
    setResults(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQIndex(0); // Reset index to start
    setDocumentId(null);
    setDocumentTitle('');
  };

  const handleUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setDocumentTitle(selectedFile.name.split('.')[0]);
    setLoading(true);
    setLoadingText('Scanning document...');

    try {
      const res = await aiExaminerService.uploadDocument(selectedFile);
      if (res.success) {
        setDocumentId(res.data.documentId);
        toast.success("Document ready!");
        setStep(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not read file. Try pasting text.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!extractedText || extractedText.length < 5) return toast.error("Text is too short.");
    
    setLoading(true);
    setLoadingText('Analyzing text...');
    
    try {
      const res = await aiExaminerService.submitText(extractedText, documentTitle || 'Study Notes');
      if (res.success) {
        setDocumentId(res.data.documentId);
        setStep(1);
      }
    } catch (err) {
      toast.error("Failed to process text.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (walletBalance < 300) return toast.error("Insufficient balance (₦300 needed)");
    
    setLoading(true);
    setLoadingText('AI is crafting your exam...');

    try {
      const res = await aiExaminerService.generateQuestions(documentId, {
        ...examConfig,
        subject: documentTitle
      });

      if (res.success) {
        await addTransaction({
          label: 'AI Exam Generation',
          amount: 300,
          type: 'debit',
          category: 'ai_service',
          status: 'Successful'
        });

        const formattedQs = res.data.questions.map((q, i) => ({
          ...q,
          id: q.id || `q-${i}`,
          options: q.options ? [...q.options].sort(() => Math.random() - 0.5) : [] 
        }));

        setQuestions(formattedQs);
        setExamId(res.data.examId);
        setCurrentQIndex(0); // Reset index here too just in case
        setTimeLeft(examConfig.duration * 60);
        setStep(2); 
      }
    } catch (err) {
      console.error(err);
      toast.error("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setLoadingText('Grading your answers...');
    try {
      const res = await aiExaminerService.submitAnswers(examId, answers);
      if (res.success) {
        setResults(res.data);
        setStep(3);
        toast.success("Grading Complete!");
      }
    } catch (err) {
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 backdrop-blur-sm z-50 fixed inset-0">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full mx-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-gray-800 text-center">{loadingText}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-sm border">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Examiner</h1>
              <p className="text-xs text-gray-500 font-medium">Study Companion</p>
            </div>
          </div>
          {step > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => { 
                if(window.confirm('Are you sure you want to quit?')) resetExamSession();
              }}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            >
              <XCircle className="h-4 w-4 mr-2" /> Quit Exam
            </Button>
          )}
        </div>

        {/* STEP 0: INPUT */}
        {step === 0 && (
          <div className="max-w-xl mx-auto mt-12 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
                What are we studying?
              </h2>
              <p className="text-gray-500">Upload your material and let AI test your knowledge.</p>
            </div>

            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="flex border-b">
                <button
                  onClick={() => setInputType('file')}
                  className={cn("flex-1 py-4 text-sm font-medium relative", inputType === 'file' ? "text-blue-600 bg-blue-50" : "text-gray-500")}
                >
                  <div className="flex items-center justify-center gap-2"><Upload className="h-4 w-4" /> Upload Document</div>
                  {inputType === 'file' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
                <button
                  onClick={() => setInputType('text')}
                  className={cn("flex-1 py-4 text-sm font-medium relative", inputType === 'text' ? "text-blue-600 bg-blue-50" : "text-gray-500")}
                >
                  <div className="flex items-center justify-center gap-2"><FileText className="h-4 w-4" /> Paste Text</div>
                  {inputType === 'text' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                </button>
              </div>

              <CardContent className="p-8">
                {inputType === 'file' ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group relative">
                    <input type="file" onChange={handleUpload} accept=".pdf,.docx,.txt" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Drop your file here</h3>
                    <p className="text-sm text-gray-500 mt-1">PDF or DOCX (Max 15MB)</p>
                    <Button variant="outline" className="mt-6 pointer-events-none">Browse Files</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input placeholder="e.g. Biology Chapter 1" value={documentTitle} onChange={e => setDocumentTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea 
                        placeholder="Paste lecture notes here..." 
                        className="min-h-[250px]"
                        value={extractedText}
                        onChange={e => setExtractedText(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleTextSubmit} size="lg" className="w-full">Analyze Text <ChevronRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 1: CONFIG */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto mt-8 animate-in slide-in-from-right-8 duration-300">
            <Button variant="ghost" className="mb-4 pl-0" onClick={() => setStep(0)}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-blue-600 w-full" />
              <CardHeader>
                <CardTitle className="text-2xl">Configure Exam</CardTitle>
                <p className="text-gray-500">Based on: <strong>{documentTitle || 'your document'}</strong></p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label>Difficulty</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <div 
                        key={level}
                        onClick={() => setExamConfig({...examConfig, difficulty: level})}
                        className={cn("cursor-pointer rounded-xl p-4 border-2 text-center transition-all", examConfig.difficulty === level ? "border-blue-600 bg-blue-50" : "border-transparent bg-gray-100")}
                      >
                        <span className="font-semibold capitalize text-gray-700">{level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Question Types</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'multiple-choice', label: 'Multiple Choice' },
                      { value: 'true-false', label: 'True/False' },
                      { value: 'fill-in-blank', label: 'Fill in Blank' },
                      { value: 'flashcard', label: 'Flashcards' }
                    ].map((type) => (
                      <div 
                        key={type.value}
                        onClick={() => {
                          const types = examConfig.questionTypes.includes(type.value)
                            ? examConfig.questionTypes.filter(t => t !== type.value)
                            : [...examConfig.questionTypes, type.value];
                          if (types.length > 0) setExamConfig({...examConfig, questionTypes: types});
                        }}
                        className={cn("cursor-pointer rounded-lg p-3 border-2 text-center text-sm transition-all", examConfig.questionTypes.includes(type.value) ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300")}
                      >
                        {type.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="flex justify-between"><span>Questions</span><span className="font-bold text-blue-600">{examConfig.questionCount}</span></Label>
                    <input type="range" min="5" max="30" step="5" value={examConfig.questionCount} onChange={(e) => setExamConfig({...examConfig, questionCount: Number(e.target.value)})} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  <div className="space-y-4">
                    <Label className="flex justify-between"><span>Duration</span><span className="font-bold text-blue-600">{examConfig.duration}m</span></Label>
                    <input type="range" min="5" max="60" step="5" value={examConfig.duration} onChange={(e) => setExamConfig({...examConfig, duration: Number(e.target.value)})} className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Sparkles className="h-4 w-4 text-yellow-600" />
                    <span>Cost: <strong>₦300</strong></span>
                  </div>
                  <Button onClick={handleGenerate} size="lg" className="px-8 shadow-lg shadow-blue-500/20">Start Exam</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 2: EXAM */}
        {step === 2 && questions.length > 0 && (
          <div className="max-w-3xl mx-auto mt-4 animate-in fade-in duration-500">
            <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6 flex items-center justify-between sticky top-4 z-20">
              <div className="flex items-center gap-4">
                <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg", timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-50 text-blue-600")}>
                  <Clock className="h-5 w-5" /> {formatTime(timeLeft)}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Question</span>
                <span className="text-lg font-bold text-gray-800">{currentQIndex + 1} <span className="text-gray-300">/ {questions.length}</span></span>
              </div>
            </div>

            <Card className="min-h-[400px] border-0 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 h-1.5 bg-blue-600 transition-all duration-500" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }} />
              <CardContent className="p-8 md:p-10">
                <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {questions[currentQIndex].type?.replace('-', ' ') || 'Multiple Choice'}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-8 leading-relaxed">{questions[currentQIndex].question}</h3>
                
                {/* Multiple Choice & True/False */}
                {questions[currentQIndex].options && (
                  <div className="space-y-4">
                    {questions[currentQIndex].options.map((opt, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setAnswers({...answers, [questions[currentQIndex].id]: opt})}
                        className={cn("group p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 relative overflow-hidden", answers[questions[currentQIndex].id] === opt ? "border-blue-600 bg-blue-50/50 shadow-md" : "border-gray-100 hover:border-gray-300 hover:bg-gray-50")}
                      >
                        <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors", answers[questions[currentQIndex].id] === opt ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 text-gray-400 group-hover:border-gray-400")}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={cn("text-lg font-medium", answers[questions[currentQIndex].id] === opt ? "text-blue-900" : "text-gray-600")}>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Fill in Blank & Flashcard */}
                {!questions[currentQIndex].options && (
                  <div className="space-y-4">
                    <Label>Your Answer</Label>
                    <Input 
                      placeholder="Type your answer here..."
                      value={answers[questions[currentQIndex].id] || ''}
                      onChange={(e) => setAnswers({...answers, [questions[currentQIndex].id]: e.target.value})}
                      className="text-lg p-4"
                    />
                  </div>
                )}
              </CardContent>
              <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                <Button variant="ghost" onClick={() => setCurrentQIndex(i => Math.max(0, i-1))} disabled={currentQIndex === 0} className="text-gray-500 hover:text-gray-900"><ChevronLeft className="h-4 w-4 mr-2" /> Previous</Button>
                {currentQIndex === questions.length - 1 ? (
                  <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 px-8 shadow-lg shadow-green-500/20">Submit Exam</Button>
                ) : (
                  <Button onClick={() => setCurrentQIndex(i => i+1)} className="px-8">Next Question <ChevronRight className="h-4 w-4 ml-2" /></Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* STEP 3: RESULTS */}
        {step === 3 && results && (
          <div className="max-w-4xl mx-auto mt-8 animate-in zoom-in-95 duration-500">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className={cn("md:col-span-2 border-0 shadow-xl overflow-hidden relative", results.grade === 'Pass' ? "bg-gradient-to-br from-green-600 to-emerald-800 text-white" : "bg-gradient-to-br from-red-600 to-rose-800 text-white")}>
                <CardContent className="p-10 flex flex-col items-center justify-center text-center h-full relative z-10">
                  <div className="bg-white/20 p-4 rounded-full mb-4 backdrop-blur-md"><Trophy className="h-12 w-12 text-white" /></div>
                  <h2 className="text-4xl font-black mb-2">{results.score} / {results.totalQuestions}</h2>
                  <p className="text-white/80 text-lg font-medium mb-6">{results.grade === 'Pass' ? 'Excellent Work!' : 'Keep Practicing!'}</p>
                  <div className="flex gap-4">
                    <div className="bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm"><span className="block text-xs opacity-70 uppercase tracking-wider">Percentage</span><span className="font-mono text-xl font-bold">{results.percentage}%</span></div>
                    <div className="bg-black/20 px-4 py-2 rounded-lg backdrop-blur-sm"><span className="block text-xs opacity-70 uppercase tracking-wider">Time</span><span className="font-mono text-xl font-bold">{formatTime(results.timeTaken)}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex flex-col justify-center p-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-blue-600" /> Next Steps</h3>
                <div className="space-y-3">
                  <Button onClick={resetExamSession} className="w-full" variant="outline"><RotateCcw className="mr-2 h-4 w-4"/> New Exam</Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white"><Calendar className="mr-2 h-4 w-4"/> Schedule Retake</Button>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4"><div className="h-8 w-1 bg-blue-600 rounded-full"></div><h3 className="text-xl font-bold text-gray-800">Detailed Solutions</h3></div>
              {results.results.map((r, idx) => (
                <Card key={idx} className={cn("border-0 shadow-sm transition-all hover:shadow-md", !r.isCorrect && "ring-1 ring-red-100 bg-red-50/10")}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 mt-1", r.isCorrect ? "bg-green-500" : "bg-red-500")}>{r.isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}</div>
                      <div className="flex-1 space-y-4">
                        <p className="font-semibold text-lg text-gray-900">{r.question}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className={cn("p-3 rounded-lg border", r.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200")}>
                            <span className="text-xs font-bold uppercase block mb-1 opacity-60">You Selected</span>
                            <span className={cn("font-medium", r.isCorrect ? "text-green-700" : "text-red-700")}>{r.userAnswer}</span>
                          </div>
                          {!r.isCorrect && (
                            <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                              <span className="text-xs font-bold uppercase block mb-1 opacity-60 text-blue-600">Correct Answer</span>
                              <span className="font-medium text-blue-800">{r.correctAnswer}</span>
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl text-sm">
                          <div className="flex items-center gap-2 mb-2 text-gray-900 dark:text-white font-semibold"><Brain className="h-4 w-4 text-purple-600" /><span>Explanation</span></div>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{r.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIExaminer;