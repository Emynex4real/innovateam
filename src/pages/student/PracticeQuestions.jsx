import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AIQuestionsService } from '../../services/aiQuestions.service';
import { 
  BookOpen, Clock, Trophy, Lock, Unlock, CheckCircle, XCircle, 
  ArrowRight, RotateCcw, Search, Zap, Wallet, BarChart, ChevronLeft,
  Brain, AlertTriangle, Sparkles, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import simpleWalletService from '../../services/simpleWallet.service';
import practiceSessionService from '../../services/practiceSession.service';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

// --- UTILS ---
const getCurrentUser = () => {
  try { return JSON.parse(localStorage.getItem('confirmedUser') || '{}'); } 
  catch (error) { return {}; }
};

const PracticeQuestions = () => {
  const { isDarkMode: isDark } = useDarkMode();
  
  // --- STATE ---
  const [view, setView] = useState('banks'); // 'banks', 'practice', 'results', 'history', 'review'
  const [mode, setMode] = useState('exam'); // 'exam' or 'learn'
  const [modeLocked, setModeLocked] = useState(false); // Lock mode after first answer
  const [checkedAnswer, setCheckedAnswer] = useState(false);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ freeQuestionsToday: 0, unlockedBanks: [] });
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [pendingExamState, setPendingExamState] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySubject, setHistorySubject] = useState('all');

  const FREE_QUESTIONS_LIMIT = 5;
  const UNLOCK_PRICE = 100;

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      await Promise.all([loadBanks(), loadWalletBalance()]);
      loadUserStats();
      // Only restore on initial load when on banks view
      if (view === 'banks') {
        restoreExamState();
      }
      if (view === 'history') loadPracticeHistory();
    };
    init();
  }, [view]);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (view === 'practice' && !practiceComplete) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view, practiceComplete]);

  // Save State
  useEffect(() => {
    if (view === 'practice' && questions.length > 0) saveExamState();
  }, [currentQuestionIndex, userAnswers, timer, view]);

  // Prevent accidental exit
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (view === 'practice' && !practiceComplete) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [view, practiceComplete]);

  // --- DATA HANDLING ---
  const saveExamState = () => {
    const currentUser = getCurrentUser();
    const examState = { selectedBank, questions, currentQuestionIndex, userAnswers, timer, timestamp: Date.now() };
    localStorage.setItem(`exam_state_${currentUser.id}`, JSON.stringify(examState));
  };

  const restoreExamState = () => {
    const currentUser = getCurrentUser();
    const saved = localStorage.getItem(`exam_state_${currentUser.id}`);
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      // Valid for 1 hour
      if (state.timestamp > Date.now() - (60 * 60 * 1000) && state.questions?.length > 0) {
        setPendingExamState(state);
        setShowRestoreDialog(true);
      } else {
        clearExamState();
      }
    } catch { clearExamState(); }
  };

  const handleRestoreConfirm = () => {
    if (pendingExamState) {
      setSelectedBank(pendingExamState.selectedBank);
      setQuestions(pendingExamState.questions);
      setCurrentQuestionIndex(pendingExamState.currentQuestionIndex);
      setUserAnswers(pendingExamState.userAnswers);
      setTimer(pendingExamState.timer);
      setView('practice');
      toast.success('Session restored successfully');
      setPendingExamState(null);
    }
  };

  const clearExamState = () => {
    const currentUser = getCurrentUser();
    localStorage.removeItem(`exam_state_${currentUser.id}`);
  };

  const loadBanks = async () => {
    try {
      setLoading(true);
      const result = await AIQuestionsService.getQuestionBanks();
      if (result.success) {
        const active = result.data.filter(b => b.is_active);
        setBanks(active);
        setSubjects([...new Set(active.map(b => b.subject).filter(Boolean))].sort());
      }
    } catch { toast.error('Could not load question banks'); } 
    finally { setLoading(false); }
  };

  const loadUserStats = async () => {
    const currentUser = getCurrentUser();
    const stats = JSON.parse(localStorage.getItem(`practice_stats_${currentUser.id}`) || '{}');
    const today = new Date().toDateString();
    if (stats.lastPracticeDate !== today) { stats.freeQuestionsToday = 0; stats.lastPracticeDate = today; }
    
    // Load unlocked banks from database
    try {
      const supabase = (await import('../../config/supabase')).default;
      const { data } = await supabase.from('user_profiles').select('unlocked_banks').eq('id', currentUser.id).single();
      const unlockedBanks = data?.unlocked_banks || [];
      setUserStats({ freeQuestionsToday: stats.freeQuestionsToday || 0, unlockedBanks });
    } catch {
      setUserStats({ freeQuestionsToday: stats.freeQuestionsToday || 0, unlockedBanks: [] });
    }
  };

  const loadWalletBalance = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser.id) return;
    try {
       const supabase = (await import('../../config/supabase')).default;
       const { data } = await supabase.from('user_profiles').select('wallet_balance').eq('id', currentUser.id).single();
       if (data) setWalletBalance(data.wallet_balance);
    } catch (e) { console.error(e); }
  };

  const loadPracticeHistory = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser.id) return;
    try {
      setHistoryLoading(true);
      const supabase = (await import('../../config/supabase')).default;
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setPracticeHistory(data || []);
    } catch (e) {
      console.error('Failed to load history:', e);
      toast.error('Could not load practice history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadSessionReview = async (session) => {
    try {
      setReviewLoading(true);
      const result = await AIQuestionsService.getQuestionsByBank(session.bank_id);
      if (result.success && result.data.length > 0) {
        setSelectedSession(session);
        setQuestions(result.data.filter(q => q.is_active));
        setUserAnswers(session.user_answers || {});
        setView('review');
      } else {
        toast.error('Could not load session questions');
      }
    } catch (e) {
      toast.error('Failed to load session review');
    } finally {
      setReviewLoading(false);
    }
  };

  const retryFromHistory = async (session) => {
    const bank = banks.find(b => b.id === session.bank_id);
    if (bank) {
      await startPractice(bank, !isBankUnlocked(bank.id));
    } else {
      toast.error('Bank not found');
    }
  };

  const getWeakAreas = () => {
    const subjectStats = {};
    practiceHistory.forEach(s => {
      if (!subjectStats[s.subject]) subjectStats[s.subject] = { total: 0, correct: 0, sessions: 0 };
      subjectStats[s.subject].total += s.total_questions;
      subjectStats[s.subject].correct += s.correct_answers;
      subjectStats[s.subject].sessions += 1;
    });
    return Object.entries(subjectStats)
      .map(([subject, stats]) => ({ subject, percentage: Math.round((stats.correct / stats.total) * 100), sessions: stats.sessions }))
      .sort((a, b) => a.percentage - b.percentage);
  };

  const isBankUnlocked = (bankId) => userStats.unlockedBanks.includes(bankId);

  const handleUnlockBank = async (bank) => {
    if (walletBalance < UNLOCK_PRICE) return toast.error(`Insufficient balance. Need ₦${UNLOCK_PRICE}`);
    
    if (!window.confirm(`Unlock "${bank.name}" for ₦${UNLOCK_PRICE}?`)) return;

    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      const result = await simpleWalletService.addTransaction(currentUser.email, UNLOCK_PRICE, `Unlocked: ${bank.name}`, 'debit');
      
      if (result.success) {
        const newUnlockedBanks = [...userStats.unlockedBanks, bank.id];
        
        // Save to database
        const supabase = (await import('../../config/supabase')).default;
        await supabase.from('user_profiles').update({ unlocked_banks: newUnlockedBanks }).eq('id', currentUser.id);
        
        setUserStats({ ...userStats, unlockedBanks: newUnlockedBanks });
        setWalletBalance(result.newBalance);
        toast.success('Bank Unlocked!');
      } else { toast.error(result.error); }
    } catch (e) { toast.error(e.message); } 
    finally { setLoading(false); }
  };

  const startPractice = async (bank, isFree = false) => {
    try {
      setLoading(true);
      const result = await AIQuestionsService.getQuestionsByBank(bank.id);
      if (result.success && result.data.length > 0) {
        let qList = result.data.filter(q => q.is_active);
        if (isFree) qList = qList.slice(0, FREE_QUESTIONS_LIMIT - userStats.freeQuestionsToday);
        
        setQuestions(qList.sort(() => Math.random() - 0.5));
        setSelectedBank(bank);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setPracticeComplete(false);
        setTimer(0);
        setCheckedAnswer(false);
        setModeLocked(false); // Reset mode lock
        setView('practice');
      } else { toast.error('Bank is empty'); }
    } catch { toast.error('Failed to start'); } 
    finally { setLoading(false); }
  };

  const completePractice = async () => {
    clearExamState();
    const score = calculateScore();
    
    if (!isBankUnlocked(selectedBank.id)) {
      const currentUser = getCurrentUser();
      const today = new Date().toDateString();
      const newStats = { 
        freeQuestionsToday: userStats.freeQuestionsToday + questions.length,
        lastPracticeDate: today,
        unlockedBanks: userStats.unlockedBanks
      };
      localStorage.setItem(`practice_stats_${currentUser.id}`, JSON.stringify(newStats));
      setUserStats(newStats);
    }

    // Save to Supabase with attempt tracking
    const sessionData = {
      bankId: selectedBank.id,
      bankName: selectedBank.name,
      subject: selectedBank.subject,
      totalQuestions: questions.length,
      correctAnswers: score.correct,
      timeSpent: timer,
      percentage: score.percentage,
      userAnswers: userAnswers // Save answers for review
    };

    const result = await practiceSessionService.savePracticeSession(sessionData);
    if (result.success) {
      const attemptMsg = result.attemptNumber > 1 ? ` (Attempt #${result.attemptNumber})` : '';
      toast.success(result.isFirstAttempt ? `+${result.pointsAwarded} XP Earned!${attemptMsg}` : `Session Recorded${attemptMsg}`);
      if (score.percentage >= 70 && result.isFirstAttempt) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#6366f1'] });
      
      // Update weekly XP for leaderboard
      if (result.isFirstAttempt && result.pointsAwarded > 0) {
        const leagueService = (await import('../../services/league.service')).default;
        await leagueService.updateWeeklyXP(result.pointsAwarded);
      }
    }

    setPracticeComplete(true);
    setView('results');
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      const userAns = String(userAnswers[q.id] || '').trim();
      const correctAns = String(q.correct_answer || '').trim();
      
      // Parse options to find the correct answer text
      let options = [];
      try { options = JSON.parse(q.options || '[]'); } catch { options = []; }
      
      // Check if correct_answer is a letter (A, B, C, D) or the full text
      let correctAnswerText = correctAns;
      if (correctAns.length === 1 && /^[A-D]$/i.test(correctAns)) {
        // It's a letter, convert to index and get the option text
        const index = correctAns.toUpperCase().charCodeAt(0) - 65;
        correctAnswerText = options[index] || correctAns;
      }
      
      if (userAns === correctAnswerText) correct++;
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) || 0 };
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // --- ANIMATIONS ---
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };

  // --- RENDERERS ---

  const renderBanksView = () => {
    let filtered = selectedSubject === 'all' ? banks : banks.filter(b => b.subject === selectedSubject);
    if (searchQuery) filtered = filtered.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-emerald-500" /> Smart Prep
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Select a module to begin your AI-powered drill.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" onClick={() => setView('history')} className="text-slate-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
               <BarChart className="w-4 h-4 mr-2" /> Progress Hub
             </Button>
             <Badge variant="outline" className="px-3 py-1.5 border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-900">
                <Zap className="w-3.5 h-3.5 mr-1 fill-current" /> {FREE_QUESTIONS_LIMIT - userStats.freeQuestionsToday} Free Daily
             </Badge>
             <Badge variant="outline" className="px-3 py-1.5 border-slate-200 dark:border-slate-800">
                <Wallet className="w-3.5 h-3.5 mr-1" /> ₦{walletBalance.toLocaleString()}
             </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96 group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
             <input 
               type="text" placeholder="Search topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
             />
           </div>
           <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 hide-scrollbar">
             {['all', ...subjects].map(sub => (
               <button key={sub} onClick={() => setSelectedSubject(sub)}
                 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                   selectedSubject === sub ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                 }`}
               >{sub.toUpperCase()}</button>
             ))}
           </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading ? [1,2,3].map(i => <div key={i} className="h-56 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"/>) : filtered.length === 0 ? (
               <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center">
                 <Search className="w-16 h-16 mb-4 opacity-20" />
                 <p>No modules found.</p>
               </div>
            ) : filtered.map(bank => {
               const isUnlocked = isBankUnlocked(bank.id);
               const canFree = userStats.freeQuestionsToday < FREE_QUESTIONS_LIMIT;
               return (
                 <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={bank.id} className="h-full">
                   <div className="group relative h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all overflow-hidden flex flex-col">
                      <div className={`absolute top-0 left-0 w-full h-1.5 ${isUnlocked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                      <div className="p-6 flex flex-col flex-1">
                         <div className="flex justify-between items-start mb-4">
                            <Badge variant="secondary" className="rounded-lg text-[10px] font-bold uppercase tracking-wider">{bank.subject}</Badge>
                            {isUnlocked ? <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full"><Unlock className="w-3.5 h-3.5" /></div> : <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full"><Lock className="w-3.5 h-3.5" /></div>}
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-emerald-500 transition-colors">{bank.name}</h3>
                         <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-6">
                            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {bank.questionCount} Qs</span>
                            <span className="flex items-center gap-1"><BarChart className="w-3.5 h-3.5" /> {bank.difficulty}</span>
                         </div>
                         <div className="mt-auto grid grid-cols-2 gap-3">
                            {isUnlocked ? (
                              <Button onClick={() => startPractice(bank)} className="col-span-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">Start Drill</Button>
                            ) : (
                              <>
                                {canFree && <Button variant="outline" onClick={() => startPractice(bank, true)} className="rounded-xl border-slate-200 dark:border-slate-700">Try Free</Button>}
                                <Button onClick={() => handleUnlockBank(bank)} className={`${canFree ? '' : 'col-span-2'} bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold`}>Unlock ₦{UNLOCK_PRICE}</Button>
                              </>
                            )}
                         </div>
                      </div>
                   </div>
                 </motion.div>
               );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const renderPracticeView = () => {
    if (!questions.length) return null;
    const q = questions[currentQuestionIndex];
    let options = [];
    try { options = JSON.parse(q.options || '[]'); } catch { options = []; }
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto py-4 md:py-8">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                if (modeLocked) {
                  toast.error('Cannot switch modes after answering questions');
                  return;
                }
                setMode('learn');
              }}
              disabled={modeLocked && mode !== 'learn'}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'learn' ? 'bg-blue-600 text-white shadow-md' : modeLocked ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🧠 Learn Mode
            </button>
            <button
              onClick={() => {
                if (modeLocked) {
                  toast.error('Cannot switch modes after answering questions');
                  return;
                }
                setMode('exam');
              }}
              disabled={modeLocked && mode !== 'exam'}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                mode === 'exam' ? 'bg-red-600 text-white shadow-md' : modeLocked ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🛡️ Exam Mode
            </button>
          </div>
          {modeLocked && (
            <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900">
              <Lock className="w-3 h-3 mr-1" /> Mode Locked
            </Badge>
          )}
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('banks')} className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><ChevronLeft className="w-5 h-5 mr-1" /> Exit</Button>
            {mode === 'exam' && <div className="flex items-center gap-2 font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl font-bold border border-emerald-100 dark:border-emerald-900"><Clock className="w-4 h-4" /> {formatTime(timer)}</div>}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 p-6 md:p-10 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800"><motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} /></div>
           
           <div className="mb-8">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} / {questions.length}</span>
             <h2 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white mt-3 leading-tight"><Latex>{q.question}</Latex></h2>
           </div>

           <div className="space-y-3">
             {options.map((opt, idx) => {
               const isSelected = userAnswers[q.id] === opt;
               const correctAnswerText = String(q.correct_answer || '').trim();
               let correctText = correctAnswerText;
               if (correctAnswerText.length === 1 && /^[A-D]$/i.test(correctAnswerText)) {
                 const index = correctAnswerText.toUpperCase().charCodeAt(0) - 65;
                 correctText = options[index] || correctAnswerText;
               }
               const isCorrect = opt === correctText;
               
               let borderClass = 'border-slate-100 dark:border-slate-800';
               if (mode === 'learn' && checkedAnswer) {
                 if (isSelected && isCorrect) borderClass = 'border-green-500 bg-green-50 dark:bg-green-900/20';
                 else if (isSelected && !isCorrect) borderClass = 'border-red-500 bg-red-50 dark:bg-red-900/20';
                 else if (!isSelected && isCorrect) borderClass = 'border-green-500 border-dashed bg-green-50/50 dark:bg-green-900/10';
               } else if (isSelected) {
                 borderClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
               }
               
               return (
                 <button key={idx} onClick={() => { 
                    if (mode === 'learn' && checkedAnswer) return;
                    const currentQ = questions[currentQuestionIndex];
                    
                    // Lock mode on first answer
                    if (!modeLocked && Object.keys(userAnswers).length === 0) {
                      setModeLocked(true);
                    }
                    
                    setUserAnswers({ ...userAnswers, [currentQ.id]: opt });
                    if (mode === 'learn') setCheckedAnswer(false);
                 }}
                 className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 group ${borderClass} ${mode === 'learn' && checkedAnswer ? 'cursor-default' : 'hover:border-emerald-200 dark:hover:border-emerald-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors ${isSelected ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 group-hover:border-emerald-300'}`}>{String.fromCharCode(65 + idx)}</div>
                    <span className={`text-base md:text-lg ${isSelected ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}><Latex>{opt}</Latex></span>
                 </button>
               )
             })}
           </div>

           {/* Learn Mode: Check Answer Button */}
           {mode === 'learn' && !checkedAnswer && userAnswers[q.id] && (
             <div className="mt-6">
               <Button onClick={() => setCheckedAnswer(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold text-base">
                 Check Answer
               </Button>
             </div>
           )}

           {/* Learn Mode: Explanation */}
           {mode === 'learn' && checkedAnswer && q.explanation && (
             <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/50">
               <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">✨ Explanation</p>
               <p className="text-sm text-slate-700 dark:text-slate-300"><Latex>{q.explanation}</Latex></p>
             </div>
           )}

           <div className="mt-10 flex justify-between items-center">
              <Button variant="outline" onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(prev => prev - 1);
                  setCheckedAnswer(false);
                }
              }} disabled={currentQuestionIndex === 0} className="rounded-xl h-12 px-6">Previous</Button>
              <Button onClick={() => {
                if (mode === 'learn' && !checkedAnswer && userAnswers[q.id]) {
                  setCheckedAnswer(true);
                  return;
                }
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(prev => prev + 1);
                  setCheckedAnswer(false);
                } else {
                  completePractice();
                }
              }} disabled={!userAnswers[q.id]} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-8 font-bold text-base shadow-lg shadow-emerald-500/20">
                {currentQuestionIndex === questions.length - 1 ? 'Finish Exam' : mode === 'learn' && !checkedAnswer ? 'Check & Next' : 'Next Question'} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
           </div>
        </div>
      </div>
    );
  };

  const renderResultsView = () => {
    const { correct, total, percentage } = calculateScore();
    const passed = percentage >= 60;
    // Donut Chart Data
    const chartData = [{ name: 'Correct', value: correct, color: '#10b981' }, { name: 'Wrong', value: total - correct, color: '#ef4444' }];

    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
           <div className={`absolute top-0 left-0 w-full h-2 ${passed ? 'bg-emerald-500' : 'bg-orange-500'}`} />
           
           <div className="mb-8 relative z-10">
             {/* DONUT CHART */}
             <div className="h-40 w-full flex justify-center mb-4">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                 <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{percentage}%</span>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Score</p>
               </div>
             </div>
             
             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{passed ? "Mission Accomplished! 🚀" : "Keep Pushing! 💪"}</h2>
             <p className="text-slate-500">You answered {correct} out of {total} questions correctly.</p>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-10 max-w-md mx-auto">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                 <p className="text-xs text-slate-400 font-bold uppercase mb-1">Time</p>
                 <p className="text-xl font-bold text-slate-900 dark:text-white">{formatTime(timer)}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                 <p className="text-xs text-slate-400 font-bold uppercase mb-1">XP Earned</p>
                 <p className="text-xl font-bold text-emerald-500">+{isBankUnlocked(selectedBank.id) ? 0 : 50}</p>
              </div>
           </div>

           <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => setView('history')} className="h-12 rounded-xl border-slate-200 dark:border-slate-700"><BarChart className="w-4 h-4 mr-2" /> View Progress Hub</Button>
              <Button onClick={() => startPractice(selectedBank, !isBankUnlocked(selectedBank.id))} className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-500/20"><RotateCcw className="w-4 h-4 mr-2" /> Retry Drill</Button>
           </div>
        </div>

        {/* Answer Review */}
        <div className="mt-8 space-y-4">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white px-4">Performance Breakdown</h3>
           {questions.map((q, i) => {
             const userAns = String(userAnswers[q.id] || '').trim();
             const correctAns = String(q.correct_answer || '').trim();
             
             // Parse options to find the correct answer text
             let options = [];
             try { options = JSON.parse(q.options || '[]'); } catch { options = []; }
             
             // Check if correct_answer is a letter (A, B, C, D) or the full text
             let correctAnswerText = correctAns;
             if (correctAns.length === 1 && /^[A-D]$/i.test(correctAns)) {
               const index = correctAns.toUpperCase().charCodeAt(0) - 65;
               correctAnswerText = options[index] || correctAns;
             }
             
             const isCorrect = userAns === correctAnswerText;
             return (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={q.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex gap-4">
                     <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                     </div>
                     <div className="flex-1">
                        <p className="font-bold text-slate-900 dark:text-white mb-2"><Latex>{q.question}</Latex></p>
                        <p className="text-sm text-slate-500 mb-1">Your Answer: <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}><Latex>{userAns || 'Skipped'}</Latex></span></p>
                        {!isCorrect && <p className="text-sm text-emerald-600">Correct Answer: <span className="font-bold"><Latex>{correctAns}</Latex></span></p>}
                        {q.explanation && (
                          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/50">
                             <p className="text-xs font-bold text-blue-600 uppercase mb-1">Explanation</p>
                             <p className="text-sm text-slate-600 dark:text-slate-300"><Latex>{q.explanation}</Latex></p>
                          </div>
                        )}
                     </div>
                  </div>
               </motion.div>
             )
           })}
        </div>
      </div>
    );
  };

  const renderReviewView = () => {
    if (!selectedSession || !questions.length) return null;
    const percentage = selectedSession.percentage || 0;
    const passed = percentage >= 60;

    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedSession.bank_name}</h1>
            <p className="text-sm text-slate-500">Session Review • {new Date(selectedSession.created_at).toLocaleDateString()}</p>
          </div>
          <Button onClick={() => setView('history')} variant="outline" className="rounded-xl">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to History
          </Button>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                {passed ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>
              <div>
                <p className={`text-4xl font-bold ${passed ? 'text-emerald-600' : 'text-orange-600'}`}>{percentage}%</p>
                <p className="text-sm text-slate-500">{selectedSession.correct_answers}/{selectedSession.total_questions} Correct</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500 mb-1">Time Spent</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(selectedSession.time_spent || 0)}</p>
              </div>
              <Button onClick={() => retryFromHistory(selectedSession)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11">
                <RotateCcw className="w-4 h-4 mr-2" /> Retry This Bank
              </Button>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Question-by-Question Breakdown</h2>
          {questions.map((q, i) => {
            const userAns = String(userAnswers[q.id] || '').trim();
            const correctAns = String(q.correct_answer || '').trim();
            
            let options = [];
            try { options = JSON.parse(q.options || '[]'); } catch { options = []; }
            
            let correctAnswerText = correctAns;
            if (correctAns.length === 1 && /^[A-D]$/i.test(correctAns)) {
              const index = correctAns.toUpperCase().charCodeAt(0) - 65;
              correctAnswerText = options[index] || correctAns;
            }
            
            const isCorrect = userAns === correctAnswerText;
            
            return (
              <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Q{i + 1}</Badge>
                      <Badge className={`text-xs ${isCorrect ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mb-4"><Latex>{q.question}</Latex></p>
                    
                    {/* Options */}
                    <div className="space-y-2 mb-4">
                      {options.map((opt, idx) => {
                        const isUserAnswer = userAns === opt;
                        const isCorrectAnswer = opt === correctAnswerText;
                        let bgClass = 'bg-slate-50 dark:bg-slate-800';
                        if (isUserAnswer && isCorrect) bgClass = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500';
                        else if (isUserAnswer && !isCorrect) bgClass = 'bg-red-50 dark:bg-red-900/20 border-red-500';
                        else if (isCorrectAnswer) bgClass = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 border-dashed';
                        
                        return (
                          <div key={idx} className={`p-3 rounded-xl border-2 ${bgClass} flex items-center gap-3`}>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isUserAnswer || isCorrectAnswer ? 'bg-white dark:bg-slate-900' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-sm flex-1"><Latex>{opt}</Latex></span>
                            {isUserAnswer && <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">Your Answer</Badge>}
                            {isCorrectAnswer && <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">Correct</Badge>}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/50">
                        <p className="text-xs font-bold text-blue-600 uppercase mb-2 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Explanation
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300"><Latex>{q.explanation}</Latex></p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} p-4 md:p-8 transition-colors`}>
      <ConfirmDialog isOpen={showRestoreDialog} onClose={() => { setShowRestoreDialog(false); clearExamState(); }} onConfirm={handleRestoreConfirm} title="Resume Session?" message="We found an unfinished practice session. Pick up where you left off?" confirmText="Resume" cancelText="Start Over" type="info" />
      {reviewLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading session review...</p>
          </div>
        </div>
      )}
      {view === 'banks' && renderBanksView()}
      {view === 'practice' && renderPracticeView()}
      {view === 'results' && renderResultsView()}
      {view === 'review' && renderReviewView()}
      {view === 'history' && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart className="h-8 w-8 text-emerald-500" /> Progress Hub
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Track your learning journey and review past sessions.</p>
            </div>
            <Button onClick={() => setView('banks')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
              <BookOpen className="w-4 h-4 mr-2" /> Back to Practice
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-amber-500" />
                <Badge variant="secondary" className="text-xs">Total</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{practiceHistory.length}</p>
              <p className="text-sm text-slate-500">Sessions Completed</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <Badge variant="secondary" className="text-xs">Avg</Badge>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{practiceHistory.length > 0 ? Math.round(practiceHistory.reduce((sum, s) => sum + (s.correct_answers || 0), 0) / practiceHistory.reduce((sum, s) => sum + (s.total_questions || 0), 0) * 100) : 0}%</p>
              <p className="text-sm text-slate-500">Average Score</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-blue-500" />
                <Badge variant="secondary" className="text-xs">Total</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{practiceHistory.reduce((sum, s) => sum + (s.total_questions || 0), 0)}</p>
              <p className="text-sm text-slate-500">Questions Answered</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-purple-500" />
                <Badge variant="secondary" className="text-xs">Total</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{Math.floor(practiceHistory.reduce((sum, s) => sum + (s.time_spent || 0), 0) / 60)}m</p>
              <p className="text-sm text-slate-500">Study Time</p>
            </div>
          </div>
          {practiceHistory.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" /> Areas to Improve
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {getWeakAreas().slice(0, 3).map(area => (
                  <div key={area.subject} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{area.subject}</span>
                      <Badge className={`text-xs ${area.percentage >= 70 ? 'bg-emerald-100 text-emerald-700' : area.percentage >= 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {area.percentage}%
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className={`h-2 rounded-full ${area.percentage >= 70 ? 'bg-emerald-500' : area.percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${area.percentage}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{area.sessions} session{area.sessions > 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Sessions</h2>
              <div className="flex gap-2">
                <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {['all', 'passed', 'failed'].map(f => (
                    <button key={f} onClick={() => setHistoryFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        historyFilter === f ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}>
                      {f === 'all' ? 'All' : f === 'passed' ? '✓ Passed' : '✗ Failed'}
                    </button>
                  ))}
                </div>
                <select value={historySubject} onChange={(e) => setHistorySubject(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 outline-none focus:border-emerald-500">
                  <option value="all">All Subjects</option>
                  {[...new Set(practiceHistory.map(s => s.subject))].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
            </div>
            {historyLoading ? (
              <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"/>)}</div>
            ) : practiceHistory.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">No practice sessions yet</p>
                <Button onClick={() => setView('banks')} className="bg-emerald-600 hover:bg-emerald-700 text-white">Start Your First Practice</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {practiceHistory
                  .filter(s => historyFilter === 'all' || (historyFilter === 'passed' ? s.percentage >= 60 : s.percentage < 60))
                  .filter(s => historySubject === 'all' || s.subject === historySubject)
                  .map((session, idx) => {
                  const percentage = session.percentage || 0;
                  const passed = percentage >= 60;
                  const date = new Date(session.created_at);
                  return (
                    <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:shadow-lg transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 cursor-pointer" onClick={() => loadSessionReview(session)}>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{session.bank_name}</h3>
                            <Badge variant="secondary" className="text-xs">{session.subject}</Badge>
                            {session.is_first_attempt && <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">First Try</Badge>}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formatTime(session.time_spent || 0)}</span>
                            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {session.total_questions} Questions</span>
                            <span className="text-xs text-slate-400">{date.toLocaleDateString()} at {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button onClick={(e) => { e.stopPropagation(); retryFromHistory(session); }} variant="outline" className="rounded-xl text-xs h-9">
                            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Retry
                          </Button>
                          <div className="text-right cursor-pointer" onClick={() => loadSessionReview(session)}>
                            <p className={`text-3xl font-bold ${passed ? 'text-emerald-600' : 'text-orange-600'}`}>{percentage}%</p>
                            <p className="text-xs text-slate-500">{session.correct_answers}/{session.total_questions} Correct</p>
                          </div>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer ${passed ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`} onClick={() => loadSessionReview(session)}>
                            {passed ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PracticeQuestions;