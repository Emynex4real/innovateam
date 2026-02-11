import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, ChevronLeft, ChevronRight, Check, Menu, X, Flag, 
  AlertTriangle, Save, HelpCircle, LayoutGrid, Timer 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import studentTCService from '../../../services/studentTC.service';
import { AntiCheatTracker } from '../../../utils/antiCheat';
import MathText from '../../../components/MathText';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';

// Mobile Haptics Helper
const triggerHaptic = (type = 'selection') => {
  if (navigator.vibrate) {
    if (type === 'error') navigator.vibrate([50, 50, 50]);
    else navigator.vibrate(10);
  }
};

const EnterpriseTakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  
  // --- STATE MANAGEMENT ---
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flagged, setFlagged] = useState({});
  const [showNav, setShowNav] = useState(false);
  const [accessInfo, setAccessInfo] = useState(null);

  // --- ANTI-CHEAT & TIMING REFS ---
  const trackerRef = useRef(new AntiCheatTracker());
  const startTimeRef = useRef(Date.now());
  const questionStartTimeRef = useRef(Date.now());

  // --- INITIALIZATION ---
  useEffect(() => {
    loadTest();
    trackerRef.current.init();
    return () => trackerRef.current.reset();
  }, [testId]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const loadTest = async () => {
    try {
      const accessResponse = await studentTCService.checkTestAccess(testId);
      
      if (!accessResponse.canAttempt) {
        if (accessResponse.reason === 'max_attempts_reached') {
          toast.error(`Maximum attempts (${accessResponse.maxAttempts}) reached`);
        } else if (accessResponse.reason === 'cooldown_active') {
          toast.error(`Please wait ${accessResponse.hoursRemaining} hour(s) before retrying`);
        }
        navigate('/student/tests');
        return;
      }
      
      setAccessInfo(accessResponse);
      
      const response = await studentTCService.getTest(testId);
      if (response.success) {
        setTest(response.questionSet);
        setTimeLeft(response.questionSet.time_limit * 60);
      }
    } catch (error) {
      toast.error('Failed to load test');
      navigate('/student/tests');
    } finally {
      setLoading(false);
    }
  };

  // --- INTERACTION HANDLERS ---
  const handleAnswer = (questionId, selectedOption) => {
    triggerHaptic('selection');
    const timeTaken = Date.now() - questionStartTimeRef.current;
    trackerRef.current.trackAnswer(questionId, timeTaken);
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    questionStartTimeRef.current = Date.now();
  };

  const handleNavigation = (direction) => {
    triggerHaptic('selection');
    if (direction === 'next' && currentIdx < test.questions.length - 1) {
      setCurrentIdx(curr => curr + 1);
      questionStartTimeRef.current = Date.now();
    } else if (direction === 'prev' && currentIdx > 0) {
      setCurrentIdx(curr => curr - 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentIdx(index);
    setShowNav(false);
    questionStartTimeRef.current = Date.now();
  };

  const toggleFlag = (questionId) => {
    triggerHaptic('selection');
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  // --- SUBMISSION HANDLER ---
  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;
    
    if (!autoSubmit) {
      const unansweredCount = test.questions.length - Object.keys(answers).length;
      if (unansweredCount > 0) {
        triggerHaptic('error');
        const confirmed = window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
        if (!confirmed) return;
      }
    }

    setSubmitting(true);
    triggerHaptic('selection');

    try {
      const totalTimeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      const formattedAnswers = test.questions.map(q => ({
        question_id: q.id,
        selected_answer: answers[q.id] || null
      }));

      const suspiciousEvents = trackerRef.current.getEvents();
      const fingerprint = trackerRef.current.getFingerprint();

      const payload = {
        question_set_id: testId,
        answers: formattedAnswers,
        time_taken: totalTimeTaken,
        suspicious_events: suspiciousEvents,
        device_fingerprint: fingerprint
      };
      
      const response = await studentTCService.submitAttempt(payload);

      if (response.success) {
        toast.success(autoSubmit ? 'Time Up! Test Submitted.' : 'Test Completed Successfully!');
        setTimeout(() => {
          navigate(`/student/results/${testId}`, { replace: true });
        }, 100);
      } else {
        console.error('Submission failed', response);
        toast.error(response.message || 'Submission failed');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Submission exception', error);
      toast.error('Submission failed. Please check your connection.');
      setSubmitting(false);
    }
  };

  // --- TOUCH HANDLERS ---
  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX; };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNavigation('next');
      else handleNavigation('prev');
    }
    touchStart.current = null;
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-zinc-950 text-zinc-400' : 'bg-gray-50 text-gray-500'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mb-4" />
        <p className="font-medium animate-pulse">Preparing Environment...</p>
      </div>
    );
  }

  const currentQuestion = test.questions[currentIdx];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((currentIdx + 1) / test.questions.length) * 100;
  
  // Timer Warning Color
  const timerColor = timeLeft < 300 
    ? 'text-red-500 border-red-500/30 bg-red-500/10' 
    : isDarkMode ? 'text-zinc-300 border-zinc-700 bg-zinc-800' : 'text-gray-700 border-gray-200 bg-white';

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* 1. TOP CONTROL BAR */}
      <header className={`sticky top-0 z-20 border-b backdrop-blur-md ${isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-gray-200'}`}>
        {/* Progress Line */}
        <div className="absolute top-0 left-0 h-1 w-full bg-gray-200 dark:bg-zinc-800">
          <motion.div 
            className="h-full bg-green-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNav(true)} 
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold truncate max-w-[200px]">{test.title}</h1>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                Question {currentIdx + 1} of {test.questions.length}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold tabular-nums transition-colors ${timerColor}`}>
            <Timer size={16} className={timeLeft < 60 ? 'animate-pulse' : ''} />
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => toggleFlag(currentQuestion.id)}
              className={`p-2 rounded-lg transition-all ${
                flagged[currentQuestion.id] 
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' 
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
              title="Flag for review"
            >
              <Flag size={20} fill={flagged[currentQuestion.id] ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN QUESTION CANVAS */}
      <main 
        className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 overflow-y-auto pb-32"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Question Text */}
            <div className={`text-lg md:text-xl font-medium leading-relaxed ${isDarkMode ? 'text-zinc-100' : 'text-gray-900'}`}>
              <div className="flex gap-4">
                <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
                  {currentIdx + 1}
                </span>
                <div className="pt-1">
                  <MathText text={currentQuestion.question_text} />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {['A', 'B', 'C', 'D'].map((letter, idx) => {
                const isSelected = answers[currentQuestion.id] === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => handleAnswer(currentQuestion.id, letter)}
                    className={`group relative flex items-start gap-4 p-4 md:p-5 text-left rounded-xl border-2 transition-all duration-200 ${
                      isSelected 
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20 dark:border-green-500 z-10' 
                        : isDarkMode 
                          ? 'border-zinc-800 bg-zinc-900 hover:border-zinc-700' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'border-green-600 bg-green-600 dark:border-green-500 dark:bg-green-500' 
                        : isDarkMode ? 'border-zinc-600 group-hover:border-zinc-500' : 'border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    
                    <div className={`flex-1 text-base ${isSelected ? 'font-semibold text-green-900 dark:text-green-100' : isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                      <MathText text={currentQuestion.options[idx]} />
                    </div>
                    
                    <span className={`absolute top-4 right-4 text-xs font-bold opacity-0 transition-opacity ${isSelected ? 'opacity-100 text-green-600 dark:text-green-400' : ''}`}>
                      {letter}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. BOTTOM NAVIGATION (Sticky) */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 border-t z-20 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={() => handleNavigation('prev')}
            disabled={currentIdx === 0}
            className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${
              isDarkMode 
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
            }`}
          >
            <ChevronLeft size={20} /> <span className="hidden sm:inline">Previous</span>
          </button>

          <div className="flex-1 flex justify-center">
             {/* Progress indicator for mobile */}
             <div className="text-xs font-medium text-gray-500 sm:hidden">
                {currentIdx + 1} / {test.questions.length}
             </div>
          </div>

          {currentIdx === test.questions.length - 1 ? (
            <button 
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : <>Submit Test <Save size={18} /></>}
            </button>
          ) : (
            <button 
              onClick={() => handleNavigation('next')}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 flex items-center gap-2 transition-transform active:scale-95"
            >
              <span className="hidden sm:inline">Next Question</span> <span className="sm:hidden">Next</span> <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 4. OVERVIEW DRAWER */}
      <AnimatePresence>
        {showNav && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNav(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 bottom-0 w-80 z-50 p-6 flex flex-col shadow-2xl border-l ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <LayoutGrid size={18} /> Test Map
                </h2>
                <button onClick={() => setShowNav(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 overflow-y-auto p-1 flex-1">
                {test.questions.map((q, i) => {
                  const isActive = i === currentIdx;
                  const isDone = answers[q.id];
                  const isFlag = flagged[q.id];
                  
                  let statusClass = isDarkMode ? 'bg-zinc-900 text-zinc-500 border-zinc-800' : 'bg-gray-50 text-gray-400 border-gray-200';
                  if (isDone) statusClass = isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-50 text-green-600 border-green-200';
                  if (isFlag) statusClass = 'bg-amber-100 text-amber-600 border-amber-300';
                  if (isActive) statusClass = 'bg-green-600 text-white border-green-600 ring-2 ring-green-300 dark:ring-green-900';

                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(i)}
                      className={`aspect-square rounded-lg font-bold text-sm border flex items-center justify-center relative transition-all ${statusClass}`}
                    >
                      {i + 1}
                      {isFlag && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white dark:border-zinc-900" />}
                    </button>
                  );
                })}
              </div>

              <div className={`mt-6 pt-6 border-t space-y-3 ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-600"></span> Current</span>
                  <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-green-400' : 'bg-green-100'}`}></span> Answered</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Flagged</span>
                </div>
                <button 
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Save size={16} /> Submit Test
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnterpriseTakeTest;