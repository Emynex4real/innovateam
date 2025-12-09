import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AIQuestionsService } from '../../services/aiQuestions.service';
import { 
  BookOpen, Clock, Trophy, Lock, Unlock, CheckCircle, XCircle, 
  ArrowRight, RotateCcw, Search, Zap, Wallet, BarChart 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import simpleWalletService from '../../services/simpleWallet.service';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// Helper function to safely get current user from localStorage
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('confirmedUser') || '{}');
  } catch (error) {
    console.error('Failed to parse current user:', error);
    return {};
  }
};

const PracticeQuestions = () => {
  const { isDarkMode: isDark } = useDarkMode();
  const [view, setView] = useState('banks'); // 'banks', 'practice', 'results'
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ freeQuestionsToday: 0, unlockedBanks: [] });
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [pendingExamState, setPendingExamState] = useState(null);

  const FREE_QUESTIONS_LIMIT = 5;
  const UNLOCK_PRICE = 300;

  useEffect(() => {
    loadBanks();
    loadUserStats();
    loadWalletBalance();
    restoreExamState();
  }, []);

  useEffect(() => {
    let interval;
    if (view === 'practice' && !practiceComplete) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view, practiceComplete]);

  // Save exam state on changes
  useEffect(() => {
    if (view === 'practice' && questions.length > 0) {
      saveExamState();
    }
  }, [currentQuestionIndex, userAnswers, timer, view]);

  // Warn before leaving during exam
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

  // --- Exam State Persistence ---

  const saveExamState = () => {
    const currentUser = getCurrentUser();
    const examState = {
      selectedBank,
      questions,
      currentQuestionIndex,
      userAnswers,
      timer,
      timestamp: Date.now()
    };
    localStorage.setItem(`exam_state_${currentUser.id}`, JSON.stringify(examState));
  };

  const restoreExamState = () => {
    const currentUser = getCurrentUser();
    const saved = localStorage.getItem(`exam_state_${currentUser.id}`);
    if (!saved) return;

    try {
      const examState = JSON.parse(saved);
      const hourAgo = Date.now() - (60 * 60 * 1000);
      
      if (examState.timestamp > hourAgo && examState.questions?.length > 0) {
        setPendingExamState(examState);
        setShowRestoreDialog(true);
      } else {
        clearExamState();
      }
    } catch (error) {
      console.error('Failed to restore exam state:', error);
      clearExamState();
    }
  };

  const handleRestoreConfirm = () => {
    if (pendingExamState) {
      setSelectedBank(pendingExamState.selectedBank);
      setQuestions(pendingExamState.questions);
      setCurrentQuestionIndex(pendingExamState.currentQuestionIndex);
      setUserAnswers(pendingExamState.userAnswers);
      setTimer(pendingExamState.timer);
      setView('practice');
      toast.success('Exam restored!');
      setPendingExamState(null);
    }
  };

  const handleRestoreCancel = () => {
    clearExamState();
    setPendingExamState(null);
  };

  const clearExamState = () => {
    const currentUser = getCurrentUser();
    localStorage.removeItem(`exam_state_${currentUser.id}`);
  };

  // --- Logic Functions ---

  const loadBanks = async () => {
    try {
      setLoading(true);
      const result = await AIQuestionsService.getQuestionBanks();
      if (result.success) {
        const activeBanks = result.data.filter(b => b.is_active);
        setBanks(activeBanks);
        const uniqueSubjects = [...new Set(activeBanks.map(b => b.subject).filter(Boolean))];
        setSubjects(uniqueSubjects.sort());
      }
    } catch (error) {
      toast.error('Failed to load question banks');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = () => {
    const currentUser = getCurrentUser();
    let stats = {};
    try {
      stats = JSON.parse(localStorage.getItem(`practice_stats_${currentUser.id}`) || '{}');
    } catch (error) {
      console.error('Failed to parse user stats:', error);
      stats = {};
    }
    const today = new Date().toDateString();
    
    if (stats.lastPracticeDate !== today) {
      stats.freeQuestionsToday = 0;
      stats.lastPracticeDate = today;
    }
    
    setUserStats({
      freeQuestionsToday: stats.freeQuestionsToday || 0,
      unlockedBanks: stats.unlockedBanks || []
    });
  };

  const loadWalletBalance = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser.id) return;
      
      const supabase = (await import('../../config/supabase')).default;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', currentUser.id)
        .single();
      
      if (!error && data) {
        setWalletBalance(data.wallet_balance || 0);
        // Note: Supabase is the source of truth; localStorage is fallback only
      } else {
        // Fallback to localStorage if Supabase fails (offline mode)
        setWalletBalance(parseInt(localStorage.getItem('wallet_balance') || '0'));
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
      toast.error('Failed to load wallet balance');
    }
  };

  const saveUserStats = (newStats) => {
    const currentUser = getCurrentUser();
    const today = new Date().toDateString();
    localStorage.setItem(`practice_stats_${currentUser.id}`, JSON.stringify({
      ...newStats,
      lastPracticeDate: today
    }));
    setUserStats(newStats);
  };

  const isBankUnlocked = (bankId) => userStats.unlockedBanks.includes(bankId);
  const canUseFreeQuestions = () => userStats.freeQuestionsToday < FREE_QUESTIONS_LIMIT;

  const handleUnlockBank = async (bank) => {
    if (walletBalance < UNLOCK_PRICE) {
      toast.error(`Insufficient balance. You need ₦${UNLOCK_PRICE}.`);
      return;
    }

    if (!window.confirm(`Unlock "${bank.name}" for ₦${UNLOCK_PRICE}?`)) return;

    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      
      if (!currentUser.id) {
        toast.error('User session expired. Please log in again.');
        return;
      }
      
      const result = await simpleWalletService.addTransaction(
        currentUser.email,
        UNLOCK_PRICE,
        `Unlocked Question Bank: ${bank.name}`,
        'debit'
      );

      if (result.success) {
        const newStats = {
          ...userStats,
          unlockedBanks: [...userStats.unlockedBanks, bank.id]
        };
        saveUserStats(newStats);
        setWalletBalance(result.newBalance);
        toast.success(`${bank.name} unlocked!`);
      } else {
        toast.error('Failed to unlock bank: ' + result.error);
      }
    } catch (error) {
      toast.error('Unlock failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startPractice = async (bank, isFree = false) => {
    try {
      setLoading(true);
      const result = await AIQuestionsService.getQuestionsByBank(bank.id);
      
      if (result.success && result.data.length > 0) {
        let questionsToUse = result.data.filter(q => q.is_active);
        
        if (isFree) {
          const remaining = FREE_QUESTIONS_LIMIT - userStats.freeQuestionsToday;
          questionsToUse = questionsToUse.slice(0, remaining);
        }
        
        questionsToUse = questionsToUse.sort(() => Math.random() - 0.5);
        
        setQuestions(questionsToUse);
        setSelectedBank(bank);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setPracticeComplete(false);
        setTimer(0);
        setView('practice');
      } else {
        toast.error('No questions available in this bank');
      }
    } catch (error) {
      toast.error('Failed to start practice');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers({ ...userAnswers, [currentQuestion.id]: answer });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completePractice();
    }
  };

  const completePractice = () => {
    clearExamState();
    const isUnlocked = isBankUnlocked(selectedBank.id);
    const score = calculateScore();
    
    if (!isUnlocked) {
      const newStats = {
        ...userStats,
        freeQuestionsToday: userStats.freeQuestionsToday + questions.length
      };
      saveUserStats(newStats);
    }
    
    // Save history logic
    const currentUser = getCurrentUser();
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(`practice_history_${currentUser.id}`) || '[]');
    } catch (error) {
      console.error('Failed to parse practice history:', error);
      history = [];
    }
    
    history.push({
      date: new Date().toISOString(),
      bankId: selectedBank.id,
      bankName: selectedBank.name,
      subject: selectedBank.subject,
      totalQuestions: questions.length,
      correctAnswers: score.correct,
      timeSpent: timer,
      percentage: score.percentage
    });
    
    localStorage.setItem(`practice_history_${currentUser.id}`, JSON.stringify(history));
    setPracticeComplete(true);
    setView('results');

    if (score.percentage >= 70) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#4ade80'] // Green confetti to match theme
      });
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      const userAns = String(userAnswers[q.id] || '').trim();
      const correctAns = String(q.correct_answer || '').trim();
      if (userAns === correctAns) correct++;
    });
    const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    return { correct, total: questions.length, percentage };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- VIEW RENDERERS ---

  // 1. The Dashboard / Banks View
  const renderBanksView = () => {
    let filteredBanks = selectedSubject === 'all' ? banks : banks.filter(b => b.subject === selectedSubject);
    if (searchQuery.trim()) {
      filteredBanks = filteredBanks.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-bold mb-1">Practice Questions</h1>
          <p className="text-gray-500 text-sm">Select a subject bank to start practicing</p>
        </div>

        {/* Stats Row - Matches Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Card */}
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Wallet Balance</p>
                  <h3 className="text-2xl font-bold">₦{walletBalance.toLocaleString()}</h3>
                  <p className="text-xs text-green-500 mt-1 font-medium">Available for unlocks</p>
                </div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Free Questions Card */}
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
             <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Daily Free Access</p>
                  <h3 className="text-2xl font-bold">{Math.max(0, FREE_QUESTIONS_LIMIT - userStats.freeQuestionsToday)} <span className="text-sm font-normal text-gray-400">/ {FREE_QUESTIONS_LIMIT}</span></h3>
                  <p className="text-xs text-blue-500 mt-1 font-medium">Resets daily</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mastery/Stats Card */}
          <Card className="border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl">
             <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Unlocked Banks</p>
                  <h3 className="text-2xl font-bold">{userStats.unlockedBanks.length}</h3>
                  <p className="text-xs text-purple-500 mt-1 font-medium">Lifetime access</p>
                </div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search - Clean Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
           <div className="relative w-full md:w-80">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search banks..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
             />
           </div>

           <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
             <button
               onClick={() => setSelectedSubject('all')}
               className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                 selectedSubject === 'all' 
                   ? 'bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none' 
                   : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
               }`}
             >
               All
             </button>
             {subjects.map(subject => (
               <button
                 key={subject}
                 onClick={() => setSelectedSubject(subject)}
                 className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                   selectedSubject === subject 
                     ? 'bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none' 
                     : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                 }`}
               >
                 {subject}
               </button>
             ))}
           </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {loading ? (
               [1,2,3].map(i => (
                 <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
               ))
            ) : filteredBanks.length === 0 ? (
               <div className="col-span-full py-12 text-center text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No question banks found matching your criteria.</p>
               </div>
            ) : (
               filteredBanks.map((bank) => {
                 const isUnlocked = isBankUnlocked(bank.id);
                 const canTryFree = canUseFreeQuestions();
                 
                 return (
                   <motion.div
                     layout
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     key={bank.id}
                   >
                     <Card className="h-full hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
                        <div className={`h-1 w-full ${isUnlocked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`} />
                        <CardContent className="p-5 flex flex-col flex-1">
                           <div className="flex justify-between items-start mb-3">
                              <Badge variant="outline" className="font-normal text-xs text-gray-500 border-gray-200 dark:border-gray-700">
                                {bank.subject}
                              </Badge>
                              {isUnlocked ? (
                                <div className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                  <Unlock className="w-3 h-3" /> OWNED
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                                  <Lock className="w-3 h-3" /> LOCKED
                                </div>
                              )}
                           </div>
                           
                           <h3 className="font-bold text-lg mb-2 line-clamp-2">{bank.name}</h3>
                           
                           <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {bank.questionCount} Qs</span>
                              <span className="flex items-center gap-1"><BarChart className="w-3 h-3" /> {bank.difficulty}</span>
                           </div>
                           
                           <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3">
                              {isUnlocked ? (
                                <Button 
                                  onClick={() => startPractice(bank)}
                                  className="col-span-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                                >
                                  Start Practice
                                </Button>
                              ) : (
                                <>
                                  {canTryFree && (
                                    <Button 
                                      variant="outline" 
                                      onClick={() => startPractice(bank, true)}
                                      className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                                    >
                                      Try Free
                                    </Button>
                                  )}
                                  <Button 
                                    onClick={() => handleUnlockBank(bank)}
                                    className={`${canTryFree ? '' : 'col-span-2'} bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90`}
                                  >
                                    Unlock ₦{UNLOCK_PRICE}
                                  </Button>
                                </>
                              )}
                           </div>
                        </CardContent>
                     </Card>
                   </motion.div>
                 );
               })
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // 2. The Active Practice View (Clean, Focus Mode)
  const renderPracticeView = () => {
    if (!questions.length) return null;
    const q = questions[currentQuestionIndex];
    let options = [];
    if (typeof q.options === 'string') {
      try {
        options = JSON.parse(q.options);
      } catch {
        options = [];
      }
    } else {
      options = q.options || [];
    }
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="max-w-3xl mx-auto py-8">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-8">
           <Button variant="ghost" onClick={() => setView('banks')} className="text-gray-500 hover:text-red-500">
             <XCircle className="w-5 h-5 mr-2" /> Exit
           </Button>
           <div className="flex items-center gap-2 font-mono text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-md font-bold">
             <Clock className="w-4 h-4" /> {formatTime(timer)}
           </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
           {/* Progress Bar */}
           <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
              <motion.div 
                className="h-full bg-green-500" 
                initial={{ width: 0 }} 
                animate={{ width: `${progress}%` }} 
              />
           </div>

           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">
             Question {currentQuestionIndex + 1} of {questions.length}
           </span>
           
           <h2 className="text-xl md:text-2xl font-bold mb-8 leading-relaxed">
             {q.question}
           </h2>

           <div className="space-y-3">
              {options.map((opt, idx) => {
                const isSelected = userAnswers[q.id] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      isSelected 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                        : 'border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-900'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                       isSelected ? 'bg-green-500 text-white border-green-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700'
                    }`}>
                       {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={isSelected ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}>
                      {opt}
                    </span>
                  </button>
                )
              })}
           </div>

           <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between">
              <Button 
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="px-8 py-6 rounded-xl font-bold text-lg"
              >
                <ArrowRight className="w-5 h-5 mr-2 rotate-180" /> Previous
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!userAnswers[q.id]}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-xl font-bold text-lg"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
           </div>
        </div>
      </div>
    );
  };

  // 3. Results View
  const renderResultsView = () => {
    const score = calculateScore();
    const passed = score.percentage >= 60;

    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center mb-8">
           <div className={`inline-flex p-4 rounded-full mb-6 ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Trophy className="w-12 h-12" />
           </div>
           
           <h2 className="text-3xl font-bold mb-2">{passed ? "Great Job!" : "Practice Needed"}</h2>
           <p className="text-gray-500 mb-8">You scored {score.percentage}% ({score.correct}/{score.total})</p>

           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                 <p className="text-sm text-gray-500 mb-1">Time Taken</p>
                 <p className="font-bold text-xl">{formatTime(timer)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                 <p className="text-sm text-gray-500 mb-1">Accuracy</p>
                 <p className="font-bold text-xl">{score.percentage}%</p>
              </div>
           </div>

           <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setView('banks')} className="py-6 px-8 rounded-xl">
                Back to Dashboard
              </Button>
              <Button onClick={() => startPractice(selectedBank, !isBankUnlocked(selectedBank.id))} className="bg-green-600 hover:bg-green-700 text-white py-6 px-8 rounded-xl">
                <RotateCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
           </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold mb-4">Review Your Answers</h3>
          {questions.map((q, index) => {
            const userAnswer = userAnswers[q.id];
            const userAns = String(userAnswer || '').trim();
            const correctAns = String(q.correct_answer || '').trim();
            const isCorrect = userAns === correctAns;
            let options = [];
            if (typeof q.options === 'string') {
              try { options = JSON.parse(q.options); } catch { options = []; }
            } else {
              options = q.options || [];
            }

            return (
              <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase">Question {index + 1}</span>
                      <Badge className={isCorrect ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    <p className="font-bold text-lg mb-4">{q.question}</p>
                    <div className="space-y-2 mb-4">
                      {options.map((opt, idx) => {
                        const optTrimmed = String(opt || '').trim();
                        const isUserAnswer = userAns === optTrimmed;
                        const isCorrectAnswer = correctAns === optTrimmed;
                        return (
                          <div key={idx} className={`p-3 rounded-lg border-2 flex items-center gap-3 ${isCorrectAnswer ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : isUserAnswer ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-800'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectAnswer ? 'bg-green-500 text-white' : isUserAnswer ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className={`flex-1 text-sm ${isCorrectAnswer || isUserAnswer ? 'font-semibold' : ''}`}>{opt}</span>
                            {isCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {isUserAnswer && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-600" />}
                          </div>
                        );
                      })}
                    </div>
                    {q.explanation && (
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Explanation</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{q.explanation}</p>
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
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} p-4 md:p-8`}>
      <ConfirmDialog
        isOpen={showRestoreDialog}
        onClose={() => {
          setShowRestoreDialog(false);
          handleRestoreCancel();
        }}
        onConfirm={handleRestoreConfirm}
        title="Continue Your Exam?"
        message="You have an unfinished exam. Would you like to continue where you left off?"
        confirmText="Continue Exam"
        cancelText="Start Fresh"
        type="info"
      />
      
      {view === 'banks' && renderBanksView()}
      {view === 'practice' && renderPracticeView()}
      {view === 'results' && renderResultsView()}
    </div>
  );
};

export default PracticeQuestions;