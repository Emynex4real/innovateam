import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import MathText from '../../../components/MathText';
import toast from 'react-hot-toast';

const ReviewAnswers = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttempt();
  }, [attemptId]);

  const loadAttempt = async () => {
    try {
      const response = await studentTCService.getAttemptDetails(attemptId);
      if (response.success) {
        setAttempt(response.attempt);
      }
    } catch (error) {
      toast.error('Failed to load answers');
      navigate('/student/centers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Review Answers</h1>
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800">
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{attempt.question_set.title}</h2>
            <p className="text-gray-600">Score: {attempt.score}% ({Math.round(attempt.score * attempt.total_questions / 100)}/{attempt.total_questions})</p>
          </div>
          <div className={`text-3xl font-bold ${attempt.score >= attempt.question_set.passing_score ? 'text-green-600' : 'text-red-600'}`}>
            {attempt.score >= attempt.question_set.passing_score ? '✓ Passed' : '✗ Failed'}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {attempt.results.map((result, idx) => (
          <div key={idx} className={`bg-white rounded-lg shadow-lg p-6 border-l-4 ${result.is_correct ? 'border-green-500' : 'border-red-500'}`}>
            <div className="flex items-start gap-3 mb-4">
              <span className="font-bold text-lg">{idx + 1}.</span>
              <MathText text={result.question_text} className="flex-1 text-lg" />
            </div>

            <div className="space-y-2 ml-8">
              {result.options.map((opt, optIdx) => {
                const letter = ['A', 'B', 'C', 'D'][optIdx];
                const isSelected = result.selected_answer === letter;
                const isCorrect = result.correct_answer === letter;

                return (
                  <div
                    key={letter}
                    className={`p-3 rounded-lg border-2 ${
                      isCorrect ? 'bg-green-50 border-green-500' :
                      isSelected ? 'bg-red-50 border-red-500' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{letter}.</span>
                      <MathText text={opt} className="flex-1" />
                      {isCorrect && <span className="text-green-600 font-bold">✓ Correct</span>}
                      {isSelected && !isCorrect && <span className="text-red-600 font-bold">✗ Your Answer</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {result.explanation && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-bold text-blue-900 mb-1">Explanation:</p>
                <MathText text={result.explanation} className="text-sm text-blue-800" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewAnswers;
