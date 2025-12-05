import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { AIQuestionsService } from '../../services/aiQuestions.service';
import { BookOpen, Clock, Trophy, Lock, Unlock, CheckCircle, XCircle, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import simpleWalletService from '../../services/simpleWallet.service';

const PracticeQuestions = () => {
  const { isDarkMode: isDark } = useDarkMode();
  const [view, setView] = useState('banks');
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ freeQuestionsToday: 0, unlockedBanks: [] });
  const [walletBalance, setWalletBalance] = useState(0);

  const FREE_QUESTIONS_LIMIT = 5;
  const UNLOCK_PRICE = 300;

  useEffect(() => {
    loadBanks();
    loadUserStats();
    loadWalletBalance();
  }, []);

  useEffect(() => {
    let interval;
    if (view === 'practice' && !practiceComplete) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view, practiceComplete]);

  const loadBanks = async () => {
    try {
      const result = await AIQuestionsService.getQuestionBanks();
      if (result.success) {
        setBanks(result.data.filter(b => b.is_active));
      }
    } catch (error) {
      toast.error('Failed to load question banks');
    }
  };

  const loadUserStats = () => {
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    const stats = JSON.parse(localStorage.getItem(`practice_stats_${currentUser.id}`) || '{}');
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
      const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
      if (!currentUser.id) return;
      
      // Import supabase
      const supabase = (await import('../../config/supabase')).default;
      
      // Get balance from Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', currentUser.id)
        .single();
      
      if (!error && data) {
        const balance = data.wallet_balance || 0;
        setWalletBalance(balance);
        localStorage.setItem('wallet_balance', balance.toString());
      } else {
        // Fallback to localStorage
        const balance = parseInt(localStorage.getItem('wallet_balance') || '0');
        setWalletBalance(balance);
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
      const balance = parseInt(localStorage.getItem('wallet_balance') || '0');
      setWalletBalance(balance);
    }
  };

  const saveUserStats = (newStats) => {
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    const today = new Date().toDateString();
    localStorage.setItem(`practice_stats_${currentUser.id}`, JSON.stringify({
      ...newStats,
      lastPracticeDate: today
    }));
    setUserStats(newStats);
  };

  const isBankUnlocked = (bankId) => {
    return userStats.unlockedBanks.includes(bankId);
  };

  const canUseFreeQuestions = () => {
    return userStats.freeQuestionsToday < FREE_QUESTIONS_LIMIT;
  };

  const handleUnlockBank = async (bank) => {
    if (walletBalance < UNLOCK_PRICE) {
      toast.error(`Insufficient balance. You need ₦${UNLOCK_PRICE}. Please fund your wallet.`);
      return;
    }

    if (!window.confirm(`Unlock "${bank.name}" for ₦${UNLOCK_PRICE}?`)) return;

    try {
      setLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
      
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
        localStorage.setItem('wallet_balance', result.newBalance.toString());
        toast.success(`${bank.name} unlocked! Unlimited access granted.`);
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
        setShowAnswer(false);
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

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completePractice();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const completePractice = () => {
    const isUnlocked = isBankUnlocked(selectedBank.id);
    
    if (!isUnlocked) {
      const newStats = {
        ...userStats,
        freeQuestionsToday: userStats.freeQuestionsToday + questions.length
      };
      saveUserStats(newStats);
    }
    
    setPracticeComplete(true);
    setView('results');
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correct_answer) correct++;
    });
    return { correct, total: questions.length, percentage: Math.round((correct / questions.length) * 100) };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderBanksView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Practice Questions</h1>
          <p className="text-gray-500 mt-1">Master your subjects with AI-generated questions</p>
        </div>
        <Card className="px-4 py-2">
          <div className="text-sm text-gray-500">Wallet Balance</div>
          <div className="text-2xl font-bold text-green-600">₦{walletBalance.toLocaleString()}</div>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">Freemium Access</h3>
              <p className="mt-1">Try {FREE_QUESTIONS_LIMIT} questions free daily, or unlock unlimited access</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{FREE_QUESTIONS_LIMIT - userStats.freeQuestionsToday}</div>
              <div className="text-sm">Free questions left today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banks.map((bank) => {
          const isUnlocked = isBankUnlocked(bank.id);
          const canTryFree = canUseFreeQuestions();

          return (
            <Card key={bank.id} className={`hover:shadow-xl transition-all ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      {bank.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{bank.subject}</p>
                  </div>
                  {isUnlocked ? (
                    <Badge className="bg-green-500">
                      <Unlock className="w-3 h-3 mr-1" /> Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="w-3 h-3 mr-1" /> Locked
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Questions:</span>
                  <span className="font-semibold">{bank.questionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Difficulty:</span>
                  <Badge variant="outline">{bank.difficulty}</Badge>
                </div>
                
                {isUnlocked ? (
                  <Button onClick={() => startPractice(bank, false)} className="w-full bg-green-600 hover:bg-green-700">
                    <Trophy className="w-4 h-4 mr-2" /> Start Practice
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {canTryFree && (
                      <Button onClick={() => startPractice(bank, true)} variant="outline" className="w-full">
                        Try {FREE_QUESTIONS_LIMIT - userStats.freeQuestionsToday} Free Questions
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleUnlockBank(bank)} 
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Unlock className="w-4 h-4 mr-2" /> Unlock for ₦{UNLOCK_PRICE}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {banks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No question banks available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );

  const renderPracticeView = () => {
    if (!questions.length) return null;
    
    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestion.id];
    
    let options = [];
    try {
      options = typeof currentQuestion.options === 'string' 
        ? JSON.parse(currentQuestion.options) 
        : currentQuestion.options || [];
    } catch (e) {
      options = [];
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </Badge>
                <Badge className={`text-lg px-4 py-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTime(timer)}
                </Badge>
              </div>
              <Button variant="outline" onClick={() => setView('banks')}>
                Exit Practice
              </Button>
            </div>

            <div className="mb-6">
              <div className="flex gap-1 mb-4">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded ${
                      userAnswers[questions[idx].id]
                        ? 'bg-blue-500'
                        : idx === currentQuestionIndex
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <Card className={`p-6 mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
              <Badge>{currentQuestion.type}</Badge>
              <Badge variant="outline" className="ml-2">{currentQuestion.difficulty}</Badge>
            </Card>

            {options.length > 0 ? (
              <div className="space-y-3">
                {options.map((option, idx) => {
                  const isSelected = userAnswer === option;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={userAnswer || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full p-4 border-2 rounded-lg"
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Previous
              </Button>
              <Button onClick={handleNext} className="flex-1">
                {currentQuestionIndex === questions.length - 1 ? 'Submit & See Results' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderResultsView = () => {
    const score = calculateScore();
    const isUnlocked = isBankUnlocked(selectedBank.id);

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="text-center">
          <CardContent className="pt-12 pb-12">
            <Trophy className={`w-20 h-20 mx-auto mb-6 ${
              score.percentage >= 80 ? 'text-yellow-500' : 
              score.percentage >= 60 ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <h1 className="text-4xl font-bold mb-2">Practice Complete!</h1>
            <p className="text-gray-500 mb-8">Great job on completing the practice session</p>

            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
              <div>
                <div className="text-4xl font-bold text-green-600">{score.correct}</div>
                <div className="text-sm text-gray-500">Correct</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-600">{score.total - score.correct}</div>
                <div className="text-sm text-gray-500">Wrong</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600">{score.percentage}%</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
            </div>

            <div className="text-gray-500 mb-8">
              <Clock className="w-5 h-5 inline mr-2" />
              Time taken: {formatTime(timer)}
            </div>

            {!isUnlocked && (
              <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white mb-6">
                <h3 className="text-xl font-bold mb-2">Want More Practice?</h3>
                <p className="mb-4">Unlock unlimited access to this question bank for just ₦{UNLOCK_PRICE}</p>
                <Button 
                  onClick={() => handleUnlockBank(selectedBank)}
                  className="bg-white text-purple-600 hover:bg-gray-100"
                >
                  <Unlock className="w-4 h-4 mr-2" /> Unlock Now
                </Button>
              </Card>
            )}

            <div className="flex gap-4 justify-center">
              <Button onClick={() => startPractice(selectedBank, !isUnlocked)} size="lg">
                <RotateCcw className="w-5 h-5 mr-2" /> Practice Again
              </Button>
              <Button onClick={() => setView('banks')} variant="outline" size="lg">
                Back to Banks
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[q.id];
              const isCorrect = userAnswer === q.correct_answer;
              
              return (
                <div key={q.id} className={`p-4 rounded-lg border-2 ${
                  isCorrect ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-red-200 bg-red-50 dark:bg-red-900/10'
                }`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-2">{idx + 1}. {q.question}</p>
                      <div className="text-sm space-y-1">
                        <div>Your answer: <span className={isCorrect ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{userAnswer || 'Not answered'}</span></div>
                        {!isCorrect && <div>Correct answer: <span className="text-green-600 font-semibold">{q.correct_answer}</span></div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {view === 'banks' && renderBanksView()}
      {view === 'practice' && renderPracticeView()}
      {view === 'results' && renderResultsView()}
    </div>
  );
};

export default PracticeQuestions;
