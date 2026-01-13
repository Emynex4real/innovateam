import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, ChevronLeft, ChevronRight, Check, Menu, X, Flag, 
  AlertTriangle, Save 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import studentTCService from '../../../services/studentTC.service';
import { AntiCheatTracker } from '../../../utils/antiCheat'; // Preserved
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
  const [showNav, setShowNav] = useState(false); // Mobile Drawer State
  const [accessInfo, setAccessInfo] = useState(null); // Attempt limit info

  // --- ANTI-CHEAT & TIMING REFS ---
  // We use refs for the tracker to persist it without re-renders
  const trackerRef = useRef(new AntiCheatTracker());
  const startTimeRef = useRef(Date.now());
  const questionStartTimeRef = useRef(Date.now());

  // --- INITIALIZATION ---
  useEffect(() => {
    loadTest();
    trackerRef.current.init(); // Start monitoring visibility/focus
    
    // Cleanup on unmount
    return () => trackerRef.current.reset();
  }, [testId]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit(true); // Auto-submit
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
      // Check access first
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
    
    // 1. Calculate time spent on this specific question
    const timeTaken = Date.now() - questionStartTimeRef.current;
    
    // 2. Log to Anti-Cheat Tracker (Preserved Functionality)
    trackerRef.current.trackAnswer(questionId, timeTaken);
    
    // 3. Update State
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    
    // 4. Reset question timer
    questionStartTimeRef.current = Date.now();
  };

  const handleNavigation = (direction) => {
    triggerHaptic('selection');
    if (direction === 'next' && currentIdx < test.questions.length - 1) {
      setCurrentIdx(curr => curr + 1);
      questionStartTimeRef.current = Date.now(); // Reset timer for new question
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

  // --- SUBMISSION HANDLER (CRITICAL) ---
  const handleSubmit = async (autoSubmit = false) => {
    // DEBUG: Uncomment for debugging
    // console.log('🚀 [SUBMIT] handleSubmit called', { autoSubmit, submitting, testId });
    
    if (submitting) {
      // DEBUG: Uncomment for debugging
      // console.warn('⚠️ [SUBMIT] Already submitting, returning early');
      return;
    }
    
    // Validation (only if not auto-submitting)
    if (!autoSubmit) {
      const unansweredCount = test.questions.length - Object.keys(answers).length;
      // DEBUG: Uncomment for debugging
      // console.log('📊 [SUBMIT] Validation check', { 
      //   totalQuestions: test.questions.length, 
      //   answeredCount: Object.keys(answers).length,
      //   unansweredCount 
      // });
      
      if (unansweredCount > 0) {
        triggerHaptic('error');
        const confirmed = window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
        // DEBUG: Uncomment for debugging
        // console.log('❓ [SUBMIT] User confirmation', { confirmed });
        if (!confirmed) {
          return;
        }
      }
    }

    // DEBUG: Uncomment for debugging
    // console.log('⏳ [SUBMIT] Setting submitting state to true');
    setSubmitting(true);
    triggerHaptic('selection');

    try {
      // 1. Calculate total duration
      const totalTimeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      // DEBUG: Uncomment for debugging
      // console.log('⏱️ [SUBMIT] Time calculation', { totalTimeTaken, startTime: startTimeRef.current });
      
      // 2. Format answers for backend
      const formattedAnswers = test.questions.map(q => ({
        question_id: q.id,
        selected_answer: answers[q.id] || null
      }));
      // DEBUG: Uncomment for debugging
      // console.log('📝 [SUBMIT] Formatted answers', { 
      //   count: formattedAnswers.length,
      //   answeredCount: formattedAnswers.filter(a => a.selected_answer !== null).length
      // });

      // 3. Get Forensic Data (Preserved Functionality)
      const suspiciousEvents = trackerRef.current.getEvents();
      const fingerprint = trackerRef.current.getFingerprint();
      // DEBUG: Uncomment for debugging
      // console.log('🔒 [SUBMIT] Anti-cheat data collected', { 
      //   suspiciousEventsCount: suspiciousEvents?.length || 0,
      //   hasFingerprint: !!fingerprint 
      // });

      // 4. Send to Backend
      const payload = {
        question_set_id: testId,
        answers: formattedAnswers,
        time_taken: totalTimeTaken,
        suspicious_events: suspiciousEvents,
        device_fingerprint: fingerprint
      };
      // DEBUG: Uncomment for debugging
      // console.log('📤 [SUBMIT] Sending to backend', payload);
      
      const response = await studentTCService.submitAttempt(payload);
      // DEBUG: Uncomment for debugging
      // console.log('✅ [SUBMIT] Backend response received', response);

      if (response.success) {
        // DEBUG: Uncomment for debugging
        // console.log('🎉 [SUBMIT] Submission successful, navigating to results');
        toast.success(autoSubmit ? 'Time Up! Test Submitted.' : 'Test Completed Successfully!');
        
        // Use setTimeout to ensure state updates complete before navigation
        setTimeout(() => {
          // DEBUG: Uncomment for debugging
          // console.log('🧭 [SUBMIT] Executing navigation to results page');
          navigate(`/student/results/${testId}`, { replace: true });
        }, 100);
      } else {
        console.error('❌ [SUBMIT] Response success flag is false', response);
        toast.error(response.message || 'Submission failed');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('💥 [SUBMIT] Exception caught during submission', {
        error,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      toast.error('Submission failed. Please check your connection.');
      setSubmitting(false);
    }
  };

  // --- SWIPE GESTURES FOR MOBILE ---
  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.targetTouches[0].clientX; };
  const onTouchEnd = (e) => {
    if (!touchStart.current) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    
    // Swipe Threshold: 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNavigation('next');
      else handleNavigation('prev');
    }
    touchStart.current = null;
  };

  // --- RENDER HELPERS ---
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-500 font-medium">Securing Test Environment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentIdx];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((currentIdx + 1) / test.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} font-sans`}>
      
      {/* 1. TOP BAR: Sticky & Informative */}
      <div className={`sticky top-0 z-30 px-4 py-3 border-b backdrop-blur-md transition-colors ${isDarkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'}`}>
        {/* Attempt Info Banner */}
        {accessInfo && accessInfo.maxAttempts && (
          <div className="max-w-4xl mx-auto mb-2">
            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
              📊 Attempt {(accessInfo.attemptsUsed || 0) + 1} of {accessInfo.maxAttempts}
              {accessInfo.attemptsRemaining !== null && accessInfo.attemptsRemaining !== undefined && (
                <span className="opacity-75">• {accessInfo.attemptsRemaining} remaining</span>
              )}
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          
          {/* Left: Mobile Menu / Title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowNav(true)} 
              className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <h1 className="font-bold text-sm leading-tight">{test.title}</h1>
              <p className="text-xs opacity-60">Question {currentIdx + 1} of {test.questions.length}</p>
            </div>
          </div>

          {/* Center: Timer */}
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600' : isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
            <Clock size={16} className={timeLeft < 300 ? 'animate-pulse' : ''} />
            <span className="font-mono font-bold tabular-nums">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Right: Flag Button */}
          <button 
            onClick={() => toggleFlag(currentQuestion.id)}
            className={`p-2 rounded-xl transition-all ${flagged[currentQuestion.id] ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Flag size={20} fill={flagged[currentQuestion.id] ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Progress Line */}
        <div className="absolute bottom-0 left-0 h-1 bg-gray-200 dark:bg-gray-800 w-full">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div 
        className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto p-4 pb-32 md:pb-8"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="py-4"
          >
            {/* Question Text */}
            <div className={`text-lg md:text-xl font-medium leading-relaxed mb-8 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              <span className="font-bold text-blue-600 mr-2">{currentIdx + 1}.</span>
              <MathText text={currentQuestion.question_text} />
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((letter, idx) => {
                const isSelected = answers[currentQuestion.id] === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => handleAnswer(currentQuestion.id, letter)}
                    className={`w-full p-4 md:p-5 rounded-2xl border-2 text-left flex items-start gap-4 transition-all active:scale-[0.99] group ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-1 ring-blue-500'
                        : isDarkMode 
                          ? 'border-gray-800 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600' 
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDarkMode 
                          ? 'bg-gray-700 text-gray-400 border-gray-600 group-hover:border-gray-500' 
                          : 'bg-gray-100 text-gray-500 border-gray-300 group-hover:border-blue-200'
                    }`}>
                      {letter}
                    </span>
                    <div className={`flex-1 pt-1 text-base ${isSelected ? 'font-medium text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      <MathText text={currentQuestion.options[idx]} />
                    </div>
                    {isSelected && <Check className="text-blue-600" size={20} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. BOTTOM ACTION BAR (Mobile Optimized) */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 border-t z-20 safe-area-bottom ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          
          <button 
            onClick={() => handleNavigation('prev')}
            disabled={currentIdx === 0}
            className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          {currentIdx === test.questions.length - 1 ? (
            <button 
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {submitting ? (
                <>Saving...</>
              ) : (
                <>Finish Test <Save size={20} /></>
              )}
            </button>
          ) : (
            <button 
              onClick={() => handleNavigation('next')}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              Next Question <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 4. NAVIGATION DRAWER (Slide-over) */}
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
              className={`fixed top-0 right-0 bottom-0 w-80 z-50 p-6 shadow-2xl flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Overview</h2>
                <button onClick={() => setShowNav(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-3 overflow-y-auto pb-20">
                {test.questions.map((q, i) => {
                  const isActive = i === currentIdx;
                  const isDone = answers[q.id];
                  const isFlag = flagged[q.id];
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(i)}
                      className={`aspect-square rounded-xl font-bold text-sm relative flex items-center justify-center transition-all ${
                        isActive 
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : isFlag 
                            ? 'bg-orange-100 text-orange-600 border-2 border-orange-400'
                            : isDone 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}
                    >
                      {i + 1}
                      {isFlag && <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-500">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-100 rounded-full border border-green-300" /> Answered</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-100 rounded-full border border-orange-300" /> Flagged</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-full" /> Current</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-100 rounded-full border border-gray-300" /> Skipped</div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EnterpriseTakeTest;