import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import studentTCService from '../../../services/studentTC.service';
import { AntiCheatTracker } from '../../../utils/antiCheat';
import toast from 'react-hot-toast';
import { componentStyles } from '../../../styles/designSystem';
import MathText from '../../../components/MathText';

const EnterpriseTakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [tracker] = useState(() => new AntiCheatTracker());

  useEffect(() => {
    loadTest();
    tracker.init();
    return () => tracker.reset();
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
    const timeTaken = Date.now() - questionStartTime;
    tracker.trackAnswer(questionId, timeTaken);
    setAnswers({ ...answers, [questionId]: answer });
    setQuestionStartTime(Date.now());
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    const unanswered = test.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0 && !window.confirm(`${unanswered.length} questions unanswered. Submit anyway?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const formattedAnswers = test.questions.map(q => ({
        question_id: q.id,
        selected_answer: answers[q.id] || null
      }));

      const response = await studentTCService.submitAttempt({
        question_set_id: testId,
        answers: formattedAnswers,
        time_taken: timeTaken,
        suspicious_events: tracker.getEvents(),
        device_fingerprint: tracker.getFingerprint()
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((currentQuestion + 1) / test.questions.length) * 100;
  const answered = Object.keys(answers).length;
  const question = test.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
              <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {test.questions.length}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-green-600'}`}>
                {minutes}:{seconds.toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-gray-500">Time Left</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={componentStyles.card.default + ' mb-6'}
          >
            <div className="flex gap-4 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                {currentQuestion + 1}
              </div>
              <div className="flex-1">
                <MathText text={question.question_text} className="text-lg font-medium text-gray-900" />
              </div>
            </div>

            <div className="space-y-3 ml-14">
              {['A', 'B', 'C', 'D'].map((letter, idx) => (
                <button
                  key={letter}
                  onClick={() => handleAnswer(question.id, letter)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[question.id] === letter
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      answers[question.id] === letter
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {letter}
                    </div>
                    <MathText text={question.options[idx]} className="flex-1 text-gray-900" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className={componentStyles.button.secondary + ' disabled:opacity-50'}
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {answered}/{test.questions.length} answered
            </span>
          </div>

          {currentQuestion < test.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className={componentStyles.button.primary}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={componentStyles.button.primary + ' bg-gradient-to-r from-green-600 to-emerald-600'}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className={componentStyles.card.default + ' mt-6'}>
          <h3 className="font-semibold text-gray-900 mb-3">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-2">
            {test.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  idx === currentQuestion
                    ? 'bg-green-600 text-white ring-2 ring-green-300'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseTakeTest;
