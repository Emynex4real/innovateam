import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';
import MathText from '../../../components/MathText';
import { hapticFeedback, useSwipeGesture } from '../../../utils/mobileOptimization';

const MobileTakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadTest();
  }, [testId]);

  useEffect(() => {
    if (timeLeft <= 0) return;
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
  }, [timeLeft]);

  const loadTest = async () => {
    try {
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

  const handleAnswer = (questionId, answer) => {
    hapticFeedback('light');
    setAnswers({ ...answers, [questionId]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestion < test.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      hapticFeedback('light');
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      hapticFeedback('light');
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    setShowQuestionNav(false);
    hapticFeedback('light');
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    const unanswered = test.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0 && !window.confirm(`${unanswered.length} questions unanswered. Submit anyway?`)) {
      return;
    }

    setSubmitting(true);
    hapticFeedback('success');
    
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const formattedAnswers = test.questions.map(q => ({
        question_id: q.id,
        selected_answer: answers[q.id] || null
      }));

      const response = await studentTCService.submitAttempt({
        question_set_id: testId,
        answers: formattedAnswers,
        time_taken: timeTaken
      });

      if (response.success) {
        toast.success('Test submitted!');
        navigate(`/student/results/${testId}`);
      }
    } catch (error) {
      toast.error('Failed to submit test');
      setSubmitting(false);
    }
  };

  // Swipe gestures
  const { handleTouchStart, handleTouchEnd } = useSwipeGesture(nextQuestion, prevQuestion);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const question = test.questions[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answered = Object.keys(answers).length;
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 safe-area-top">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 dark:text-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ← Back
            </button>
            <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <button
              onClick={() => setShowQuestionNav(true)}
              className="text-blue-600 dark:text-blue-400 min-h-[44px] px-4 flex items-center justify-center"
            >
              {currentQuestion + 1}/{test.questions.length}
            </button>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div
        className="pt-28 px-4 pb-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-start gap-3 mb-6">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 min-w-[32px]">
              {currentQuestion + 1}.
            </span>
            <MathText text={question.question_text} className="flex-1 text-lg leading-relaxed" />
          </div>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
              <button
                key={letter}
                onClick={() => handleAnswer(question.id, letter)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all min-h-[60px] ${
                  answers[question.id] === letter
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-md'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 active:scale-98'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-lg min-w-[24px]">{letter}.</span>
                  <MathText text={question.options[optIdx]} className="flex-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Swipe Hint */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          ← Swipe to navigate →
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 safe-area-bottom">
        <div className="flex gap-3">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex-1 min-h-[48px] bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition"
          >
            ← Previous
          </button>
          {currentQuestion === test.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 min-h-[48px] bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex-1 min-h-[48px] bg-blue-600 text-white rounded-xl font-semibold active:scale-95 transition"
            >
              Next →
            </button>
          )}
        </div>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          {answered}/{test.questions.length} answered
        </div>
      </div>

      {/* Question Navigation Modal */}
      {showQuestionNav && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
          onClick={() => setShowQuestionNav(false)}
        >
          <div
            className="w-full max-h-[80vh] bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl md:max-w-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 md:hidden" />
              <h3 className="text-xl font-bold mb-4">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-3">
                {test.questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    className={`aspect-square rounded-xl font-bold text-lg transition ${
                      idx === currentQuestion
                        ? 'bg-blue-600 text-white'
                        : answers[q.id]
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileTakeTest;
