import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';
import MathText from '../../../components/MathText';

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    setAnswers({ ...answers, [questionId]: answer });
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

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answered = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{test.title}</h1>
            <p className="text-gray-600">Question {answered}/{test.questions.length}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-blue-600'}`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <p className="text-sm text-gray-500">Time Left</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-6">
        {test.questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex gap-3 mb-4">
              <span className="font-bold text-lg">{idx + 1}.</span>
              <MathText text={q.question_text} className="flex-1 text-lg" />
            </div>
            <div className="space-y-2 ml-8">
              {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                <label
                  key={letter}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                    answers[q.id] === letter
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    checked={answers[q.id] === letter}
                    onChange={() => handleAnswer(q.id, letter)}
                    className="w-4 h-4"
                  />
                  <span className="font-semibold">{letter}.</span>
                  <MathText text={q.options[optIdx]} className="flex-1" />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 sticky bottom-0">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-lg font-semibold"
        >
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>
    </div>
  );
};

export default TakeTest;
