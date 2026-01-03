import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, HelpCircle } from 'lucide-react';
import studentTCService from '../../../services/studentTC.service';
import MathText from '../../../components/MathText';
import toast from 'react-hot-toast';

const ReviewAnswers = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await studentTCService.getAttemptDetails(attemptId);
        if (res.success) setAttempt(res.attempt);
      } catch (e) { toast.error("Error loading details"); } 
      finally { setLoading(false); }
    };
    load();
  }, [attemptId]);

  if(loading) return <div className="p-8 text-center">Loading review...</div>;

  const percentage = attempt.score;
  const passed = percentage >= attempt.question_set.passing_score;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 px-4 py-4 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
          <ChevronLeft />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900 dark:text-white line-clamp-1">{attempt.question_set.title}</h1>
          <p className="text-xs text-gray-500">Review Mode</p>
        </div>
        <div className={`px-4 py-1 rounded-full text-sm font-bold ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {percentage}%
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {attempt.results.map((q, i) => {
          const isCorrect = q.is_correct;
          return (
            <div key={i} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <div className="flex gap-4 mb-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                  {i + 1}
                </span>
                <div className="text-lg font-medium text-gray-900 dark:text-white">
                  <MathText text={q.question_text} />
                </div>
              </div>

              <div className="space-y-2 pl-12">
                {q.options.map((opt, idx) => {
                  const letter = ['A','B','C','D'][idx];
                  const isSelected = q.selected_answer === letter;
                  const isAnswer = q.correct_answer === letter;
                  
                  let style = "border-gray-200 dark:border-gray-700 bg-transparent";
                  if (isAnswer) style = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                  else if (isSelected && !isCorrect) style = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";

                  return (
                    <div key={idx} className={`p-3 rounded-xl border-2 flex items-start gap-3 ${style}`}>
                      <span className="font-bold">{letter}.</span>
                      <MathText text={opt} />
                      {isAnswer && <Check size={16} className="ml-auto text-green-600" />}
                      {isSelected && !isAnswer && <X size={16} className="ml-auto text-red-600" />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="mt-4 ml-12 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-sm text-blue-800 dark:text-blue-200 flex gap-3">
                  <HelpCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-1">Explanation</span>
                    <MathText text={q.explanation} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewAnswers;