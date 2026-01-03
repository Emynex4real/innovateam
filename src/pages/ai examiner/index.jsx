import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import aiExaminerService from '../../services/aiExaminer.service';
import { useWallet } from '../../contexts/WalletContext';
import { 
  Upload, FileText, Clock, CheckCircle, Trophy, 
  RotateCcw, Brain, ChevronRight, Loader2, AlertCircle, XCircle, 
  Sparkles, GraduationCap, ChevronLeft, Calendar, FileType
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { motion } from 'framer-motion';

const AIExaminer = () => {
  const { walletBalance, addTransaction } = useWallet();
  
  // --- STATE ---
  const [step, setStep] = useState(0); // 0=Input, 1=Config, 2=Exam, 3=Results
  const [inputType, setInputType] = useState('file'); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  // Data
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [documentId, setDocumentId] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');
  
  // Exam Logic
  const [examConfig, setExamConfig] = useState({ 
    questionCount: 10, 
    difficulty: 'medium', 
    duration: 30, 
    questionTypes: ['multiple-choice'] 
  });
  const [examId, setExamId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);
  const [flashcardRevealed, setFlashcardRevealed] = useState({});
  
  // Dialogs
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [pendingExamState, setPendingExamState] = useState(null);

  // --- PERSISTENCE & TIMER ---
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
  }, [step, timeLeft]);

  useEffect(() => { 
    if (step === 2 && questions.length > 0) saveExamState(); 
  }, [currentQIndex, answers, timeLeft, step]);
  
  useEffect(() => { 
    restoreExamState(); 
  }, []);

  // --- STATE HELPERS ---
  const getCurrentUser = () => { 
    try { 
      return JSON.parse(localStorage.getItem('confirmedUser') || '{}'); 
    } catch { 
      return {}; 
    } 
  };
  
  const saveExamState = () => {
    const state = { 
      examId, 
      documentId, 
      documentTitle, 
      examConfig, 
      questions, 
      currentQIndex, 
      answers, 
      timeLeft, 
      flashcardRevealed, 
      timestamp: Date.now() 
    };
    localStorage.setItem(`ai_exam_state_${getCurrentUser().id}`, JSON.stringify(state));
  };

  const restoreExamState = () => {
    const saved = localStorage.getItem(`ai_exam_state_${getCurrentUser().id}`);
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      if (state.timestamp > Date.now() - (60 * 60 * 1000) && state.questions?.length > 0) {
        setPendingExamState(state);
        setShowRestoreDialog(true);
      } else { 
        clearExamState(); 
      }
    } catch { 
      clearExamState(); 
    }
  };

  const clearExamState = () => localStorage.removeItem(`ai_exam_state_${getCurrentUser().id}`);

  // --- RESTORE HANDLERS ---
  const handleRestoreCancel = () => {
    clearExamState();
    setPendingExamState(null);
    setShowRestoreDialog(false);
  };

  const handleRestoreConfirm = () => {
    if (pendingExamState) {
      setExamId(pendingExamState.examId);
      setDocumentId(pendingExamState.documentId);
      setDocumentTitle(pendingExamState.documentTitle);
      setExamConfig(pendingExamState.examConfig);
      setQuestions(pendingExamState.questions);
      setCurrentQIndex(pendingExamState.currentQIndex);
      setAnswers(pendingExamState.answers);
      setTimeLeft(pendingExamState.timeLeft);
      setFlashcardRevealed(pendingExamState.flashcardRevealed || {});
      setStep(2);
      toast.success('Exam restored!');
      setPendingExamState(null);
      setShowRestoreDialog(false);
    }
  };

  const resetExamSession = () => {
    clearExamState();
    setStep(0);
    setFile(null);
    setExtractedText('');
    setResults(null);
    setQuestions([]);
    setAnswers({});
    setCurrentQIndex(0);
    setDocumentId(null);
    setDocumentTitle('');
    setFlashcardRevealed({});
    setShowQuitDialog(false);
  };

  // --- ACTIONS ---
  const handleUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setDocumentTitle(selectedFile.name.split('.')[0]);
    setLoading(true);
    setLoadingText('Scanning document with AI...');
    
    try {
      const res = await aiExaminerService.uploadDocument(selectedFile);
      if (res && res.success) {
        setDocumentId(res.data.documentId);
        toast.success("Document analyzed successfully!");
        setStep(1);
      } else { 
        toast.error(res?.message || "Upload failed"); 
      }
    } catch (err) { 
      toast.error(err.message || "Could not read file."); 
      setFile(null); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleTextSubmit = async () => {
    if (!extractedText || extractedText.length < 20) {
      return toast.error("Please add more detail (at least 20 characters).");
    }
    
    setLoading(true);
    setLoadingText('Analyzing your notes...');
    
    try {
      const res = await aiExaminerService.submitText(extractedText, documentTitle || 'Study Notes');
      if (res && res.success) {
        setDocumentId(res.data.documentId);
        toast.success("Text analyzed successfully!");
        setStep(1);
      } else { 
        toast.error(res?.message || "Analysis failed"); 
      }
    } catch (err) { 
      toast.error(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // ✅ CORRECTED: Generate questions based on document content
  const handleGenerate = async () => {
    // 1. Validation
    if (walletBalance < 300) {
      return toast.error("Insufficient balance (₦300 needed)");
    }
    
    if (!documentId) {
      return toast.error("Please upload a document or paste text first");
    }

    if (!documentTitle) {
      return toast.error("Document title is missing");
    }

    setLoading(true);
    setLoadingText('🤖 AI is analyzing your document and creating questions...');
    
    try {
      // 2. Prepare payload - Use documentTitle as the topic/subject
      // The backend will read the document content and generate questions from it
      const payload = {
        documentId: documentId,
        subject: documentTitle,  // Document title used as subject identifier
        questionCount: examConfig.questionCount,
        difficulty: examConfig.difficulty,
        duration: examConfig.duration,
        questionTypes: examConfig.questionTypes
      };

      console.log("🚀 Sending Payload:", payload);

      // 3. Generate questions from document content
      const res = await aiExaminerService.generateQuestions(documentId, payload);
      
      console.log("✅ Generate response:", res);

      // 4. Handle success
      if (res && res.success && res.data) {
        console.log("📋 Questions received:", res.data.questions);
        console.log("📋 First question structure:", res.data.questions[0]);
        
        // ✅ Store questions and exam data
        setQuestions(res.data.questions);
        setExamId(res.data.examId);
        setTimeLeft(examConfig.duration * 60);
        
        // Deduct cost from wallet
        await addTransaction({
          type: 'debit',
          category: 'AI Examiner',
          amount: 300,
          description: `AI Exam: ${documentTitle} (${examConfig.questionCount} questions)`
        });
        
        // ✅ Move to exam step - THIS IS CRITICAL!
        setStep(2);
        
        toast.success(`🎉 Generated ${res.data.questions.length} questions from your document!`);
      } else {
        toast.error(res?.message || "Failed to generate questions");
      }
      
    } catch (err) { 
      console.error("❌ Generate Error:", err);
      toast.error(err.message || "Generation failed. Please try again."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async () => {
    clearExamState();
    setLoading(true);
    setLoadingText('AI is grading your answers...');
    
    try {
      const res = await aiExaminerService.submitAnswers(examId, answers);
      if (res && res.success) {
        setResults(res.data);
        setStep(3);
        toast.success("Grading Complete!");
      } else {
        toast.error(res?.message || "Submission failed");
      }
    } catch (err) { 
      toast.error(err.message || "Submission failed."); 
    } finally { 
      setLoading(false); 
    }
  };

  const formatTime = (s) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 dark:bg-black/50 backdrop-blur-sm z-50 fixed inset-0">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-gray-100 dark:border-gray-800">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center animate-pulse">
            {loadingText}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 font-sans">
      <ConfirmDialog 
        isOpen={showRestoreDialog} 
        onClose={handleRestoreCancel} 
        onConfirm={handleRestoreConfirm} 
        title="Resume Exam?" 
        message="Continue where you left off?" 
        confirmText="Resume" 
        cancelText="Restart" 
        type="info" 
      />
      <ConfirmDialog 
        isOpen={showQuitDialog} 
        onClose={() => setShowQuitDialog(false)} 
        onConfirm={resetExamSession} 
        title="Quit Exam?" 
        message="Progress will be lost." 
        confirmText="Quit" 
        cancelText="Cancel" 
        type="warning" 
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-gray-900 p-2.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <Brain className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Examiner</h1>
              <p className="text-xs text-gray-500 font-medium">Deep Assessment Engine</p>
            </div>
          </div>
          {step === 2 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowQuitDialog(true)} 
              className="text-red-500 hover:bg-red-50 border-red-200 rounded-lg"
            >
              <XCircle className="h-4 w-4 mr-2" /> Quit
            </Button>
          )}
        </div>

        {/* STEP 0: INPUT */}
        {step === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-xl mx-auto mt-12"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                What are we testing today?
              </h2>
              <p className="text-gray-500">
                Upload documents or paste notes. AI will generate questions from your content.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex border-b border-gray-100 dark:border-gray-800">
                <button 
                  onClick={() => setInputType('file')} 
                  className={cn(
                    "flex-1 py-4 text-sm font-bold transition-colors",
                    inputType === 'file' 
                      ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" 
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  Document Upload
                </button>
                <button 
                  onClick={() => setInputType('text')} 
                  className={cn(
                    "flex-1 py-4 text-sm font-bold transition-colors",
                    inputType === 'text' 
                      ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" 
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  Paste Text
                </button>
              </div>

              <div className="p-8">
                {inputType === 'file' ? (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center hover:border-indigo-500 hover:bg-indigo-50/10 transition-all cursor-pointer group relative">
                    <input 
                      type="file" 
                      onChange={handleUpload} 
                      accept=".pdf,.docx,.txt" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Click to Upload</h3>
                    <p className="text-sm text-gray-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Subject Title</Label>
                      <Input 
                        placeholder="e.g. Organic Chemistry" 
                        value={documentTitle} 
                        onChange={e => setDocumentTitle(e.target.value)} 
                        className="rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea 
                        placeholder="Paste your notes here..." 
                        className="min-h-[200px] rounded-xl" 
                        value={extractedText} 
                        onChange={e => setExtractedText(e.target.value)} 
                      />
                    </div>
                    <Button 
                      onClick={handleTextSubmit} 
                      size="lg" 
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold"
                    >
                      Analyze Text <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 1: CONFIG */}
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="max-w-2xl mx-auto mt-8"
          >
            <Button 
              variant="ghost" 
              className="mb-4 pl-0 hover:bg-transparent" 
              onClick={() => setStep(0)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            
            <Card className="rounded-[2rem] border-0 shadow-2xl dark:bg-gray-900">
              <CardHeader className="pb-0">
                <CardTitle className="text-2xl">Exam Configuration</CardTitle>
                <p className="text-gray-500">
                  Customize your assessment for <strong>{documentTitle}</strong>
                </p>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                <div className="space-y-3">
                  <Label>Difficulty</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button 
                        key={level} 
                        onClick={() => setExamConfig({...examConfig, difficulty: level})} 
                        className={cn(
                          "rounded-xl p-3 border-2 font-bold capitalize transition-all",
                          examConfig.difficulty === level 
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" 
                            : "border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500"
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="flex justify-between">
                      <span>Questions</span>
                      <span className="font-bold text-indigo-600">{examConfig.questionCount}</span>
                    </Label>
                    <input 
                      type="range" 
                      min="5" 
                      max="30" 
                      step="5" 
                      value={examConfig.questionCount} 
                      onChange={(e) => setExamConfig({...examConfig, questionCount: Number(e.target.value)})} 
                      className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg cursor-pointer" 
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="flex justify-between">
                      <span>Duration (Min)</span>
                      <span className="font-bold text-indigo-600">{examConfig.duration}m</span>
                    </Label>
                    <input 
                      type="range" 
                      min="5" 
                      max="60" 
                      step="5" 
                      value={examConfig.duration} 
                      onChange={(e) => setExamConfig({...examConfig, duration: Number(e.target.value)})} 
                      className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg cursor-pointer" 
                    />
                  </div>
                </div>
                
                <div className="pt-6 border-t dark:border-gray-800 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Sparkles className="h-4 w-4 text-amber-500" /> Cost: ₦300
                  </div>
                  <Button 
                    onClick={handleGenerate} 
                    size="lg" 
                    className="px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30"
                  >
                    Start Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* STEP 2: EXAM */}
        {step === 2 && questions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="max-w-3xl mx-auto mt-4"
          >
            {/* Timer Bar */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex items-center justify-between sticky top-4 z-20">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg border",
                timeLeft < 60 
                  ? "bg-red-50 text-red-600 border-red-100 animate-pulse" 
                  : "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900 dark:text-indigo-400"
              )}>
                <Clock className="h-5 w-5" /> {formatTime(timeLeft)}
              </div>
              <span className="text-sm font-bold text-gray-400">
                Q{currentQIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Question Card */}
            <Card className="min-h-[400px] border-0 shadow-xl overflow-hidden relative rounded-[2rem] dark:bg-gray-900">
              <div 
                className="absolute top-0 left-0 h-1.5 bg-indigo-600 transition-all duration-500" 
                style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }} 
              />
              
              <CardContent className="p-8 md:p-12">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full mb-6 inline-block">
                  {questions[currentQIndex].type || 'multiple-choice'}
                </span>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 leading-relaxed">
                  {questions[currentQIndex].question}
                </h3>
                
                <div className="space-y-3">
                  {(questions[currentQIndex].options && Array.isArray(questions[currentQIndex].options) 
                    ? questions[currentQIndex].options 
                    : []).map((opt, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setAnswers({...answers, [questions[currentQIndex].id]: opt})} 
                      className={cn(
                        "cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group",
                        answers[questions[currentQIndex].id] === opt 
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md" 
                          : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg border-2 flex items-center justify-center flex-shrink-0 text-sm font-bold",
                        answers[questions[currentQIndex].id] === opt 
                          ? "border-indigo-600 bg-indigo-600 text-white" 
                          : "border-gray-300 text-gray-400"
                      )}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={cn(
                        "text-lg",
                        answers[questions[currentQIndex].id] === opt 
                          ? "font-bold text-indigo-900 dark:text-indigo-300" 
                          : "text-gray-600 dark:text-gray-400"
                      )}>
                        {opt}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-800 flex justify-between items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentQIndex(i => Math.max(0, i-1))} 
                  disabled={currentQIndex === 0}
                >
                  Previous
                </Button>
                
                {currentQIndex === questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit} 
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 shadow-lg shadow-indigo-500/20"
                  >
                    Submit Exam
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setCurrentQIndex(i => i+1)} 
                    className="rounded-xl px-6"
                  >
                    Next
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* STEP 3: RESULTS */}
        {step === 3 && results && (
          <motion.div 
            initial={{ scale: 0.9 }} 
            animate={{ scale: 1 }} 
            className="max-w-4xl mx-auto mt-8"
          >
            <div className={cn(
              "rounded-[2.5rem] p-12 text-center text-white mb-8 shadow-2xl relative overflow-hidden",
              results.percentage >= 70 
                ? "bg-gradient-to-br from-emerald-600 to-teal-800" 
                : "bg-gradient-to-br from-indigo-600 to-purple-800"
            )}>
              <div className="relative z-10">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-white/90" />
                <h2 className="text-5xl font-black mb-2">{results.percentage}%</h2>
                <p className="text-xl font-medium text-white/80 mb-8">
                  {results.percentage >= 70 
                    ? 'Outstanding Performance!' 
                    : 'Good Effort, Keep Improving!'}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(0)} 
                    className="border-white/30 text-white hover:bg-white/10 hover:text-white rounded-xl h-12 px-6"
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    onClick={resetExamSession} 
                    className="bg-white text-indigo-900 hover:bg-gray-100 rounded-xl h-12 px-8 font-bold"
                  >
                    New Exam
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white px-4">
                Detailed Review
              </h3>
              
              {results.results?.map((r, idx) => (
                <Card 
                  key={idx} 
                  className={cn(
                    "border-0 shadow-sm overflow-hidden",
                    !r.isCorrect && "ring-1 ring-red-100 dark:ring-red-900/30"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1",
                        r.isCorrect ? "bg-emerald-500" : "bg-red-500"
                      )}>
                        {r.isCorrect ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          {r.question}
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className={cn(
                            "p-3 rounded-lg border",
                            r.isCorrect 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                              : "bg-red-50 border-red-200 text-red-800"
                          )}>
                            <span className="block text-xs font-bold uppercase opacity-60 mb-1">
                              Your Answer
                            </span>
                            {r.userAnswer}
                          </div>
                          
                          {!r.isCorrect && (
                            <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
                              <span className="block text-xs font-bold uppercase opacity-60 mb-1">
                                Correct Answer
                              </span>
                              {r.correctAnswer}
                            </div>
                          )}
                        </div>
                        
                        {r.explanation && (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            <span className="font-bold text-gray-900 dark:text-white mr-2">
                              Explanation:
                            </span>
                            {r.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AIExaminer;