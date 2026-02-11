import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import studentTCService from '../../../services/studentTC.service';
import tutorialCenterService from '../../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  RefreshCw, 
  BookOpen, 
  Award, 
  BarChart2,
  ChevronRight,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EnterpriseResults = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [attempts, setAttempts] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingRemedial, setGeneratingRemedial] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    loadData();
  }, [testId]);

  useEffect(() => {
    if (attempts.length > 0 && !selectedAttempt) {
      setSelectedAttempt(attempts[0]);
    }
  }, [attempts]);

  const loadData = async () => {
    try {
      const [attemptsRes, testRes] = await Promise.all([
        studentTCService.getMyAttempts(testId),
        studentTCService.getTest(testId)
      ]);
      
      if (attemptsRes.success) setAttempts(attemptsRes.attempts);
      if (testRes.success) setTest(testRes.questionSet);
    } catch (error) {
      console.error('Failed to load data', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleRemedial = async (attemptId) => {
    setGeneratingRemedial(true);
    try {
      const res = await tutorialCenterService.generateRemedialTest(attemptId);
      
      if (res.success) {
        toast.success('Practice test created based on your mistakes!');
        setTimeout(() => {
          navigate(`/student/test/${res.remedial_test.id}`, { replace: true });
        }, 500);
      } else {
        toast.error(res.error || 'Failed to generate practice test');
        setGeneratingRemedial(false);
      }
    } catch (error) {
      console.error('Remedial error', error);
      toast.error('Failed to generate practice test');
      setGeneratingRemedial(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-zinc-950 text-zinc-400' : 'bg-gray-50 text-gray-500'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="font-medium">Calculating Performance...</p>
      </div>
    );
  }

  // Derived Stats
  const bestAttempt = attempts.reduce((best, curr) => curr.score > best.score ? curr : best, attempts[0] || {});
  const avgScore = attempts.length ? Math.round(attempts.reduce((sum, att) => sum + att.score, 0) / attempts.length) : 0;
  const improvement = attempts.length > 1 ? attempts[0].score - attempts[attempts.length - 1].score : 0;
  const passRate = attempts.length ? Math.round(attempts.filter(a => a.score >= test.passing_score).length / attempts.length * 100) : 0;

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/student/tests')}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ArrowLeft size={16} /> Back to Assessments
          </button>
        </div>

        {attempts.length === 0 ? (
          /* Empty State */
          <div className={`max-w-2xl mx-auto text-center p-12 rounded-2xl border border-dashed ${isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-300 bg-white'}`}>
            <div className={`inline-flex p-4 rounded-full mb-6 ${isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
              <BookOpen size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Results Yet</h2>
            <p className={`mb-8 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              You haven't attempted <strong>{test?.title}</strong> yet. Complete the test to see detailed analytics here.
            </p>
            <button
              onClick={() => navigate(`/student/test/${testId}`)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              Start Assessment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: Main Report Card (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Header Info */}
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{test?.title}</h1>
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                  <BarChart2 size={16} /> 
                  <span>Performance Report</span>
                  <span className="mx-2">•</span>
                  <span>{attempts.length} Attempt{attempts.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {selectedAttempt && (
                <motion.div 
                  key={selectedAttempt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}
                >
                  {/* Result Header Banner */}
                  <div className={`p-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    isDarkMode ? 'border-zinc-800' : 'border-gray-100'
                  }`}>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                          selectedAttempt.score >= test.passing_score 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {selectedAttempt.score >= test.passing_score ? 'Passed' : 'Failed'}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                          Attempt ID: #{selectedAttempt.id.toString().slice(-4)}
                        </span>
                      </div>
                      <div className={`text-sm flex items-center gap-4 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(selectedAttempt.completed_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} /> {Math.floor(selectedAttempt.time_taken / 60)}m {selectedAttempt.time_taken % 60}s</span>
                      </div>
                    </div>
                    
                    {/* Big Score Display */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-5xl font-black tracking-tight ${
                          selectedAttempt.score >= test.passing_score 
                            ? 'text-emerald-500' 
                            : 'text-rose-500'
                        }`}>
                          {selectedAttempt.score}%
                        </div>
                        <div className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                          Pass Score: {test.passing_score}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className={`p-6 ${isDarkMode ? 'bg-zinc-900' : 'bg-white'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Primary Actions */}
                      <div className="flex flex-col gap-3">
                        {test.show_answers && (
                          <button
                            onClick={() => navigate(`/student/review/${selectedAttempt.id}`)}
                            className={`w-full py-3 px-4 rounded-xl font-semibold border flex items-center justify-center gap-2 transition-all ${
                              isDarkMode 
                                ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white' 
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <BookOpen size={18} /> Review Answers
                          </button>
                        )}
                        
                        <button
                          onClick={() => navigate(`/student/test/${testId}`)}
                          className={`w-full py-3 px-4 rounded-xl font-semibold border flex items-center justify-center gap-2 transition-all ${
                            isDarkMode 
                              ? 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white' 
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <RefreshCw size={18} /> Retake Test
                        </button>
                      </div>

                      {/* Remedial Action (Only if failed) */}
                      {selectedAttempt.score < 70 ? (
                        <div className={`p-4 rounded-xl border flex flex-col justify-center ${
                          isDarkMode ? 'bg-amber-900/10 border-amber-900/30' : 'bg-amber-50 border-amber-100'
                        }`}>
                          <h4 className={`text-sm font-bold mb-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-800'}`}>
                            Need more practice?
                          </h4>
                          <p className={`text-xs mb-3 ${isDarkMode ? 'text-amber-200/70' : 'text-amber-700/70'}`}>
                            Generate a custom test focusing specifically on the questions you missed.
                          </p>
                          <button
                            onClick={() => handleRemedial(selectedAttempt.id)}
                            disabled={generatingRemedial}
                            className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                              generatingRemedial 
                                ? 'bg-amber-200 text-amber-800 cursor-not-allowed' 
                                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                            }`}
                          >
                            {generatingRemedial ? (
                              <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <><Zap size={16} /> Generate Practice Test</>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className={`p-4 rounded-xl border flex flex-col justify-center items-center text-center ${
                          isDarkMode ? 'bg-emerald-900/10 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100'
                        }`}>
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full text-emerald-600 mb-2">
                            <Award size={24} />
                          </div>
                          <h4 className={`text-sm font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-800'}`}>
                            Great Job!
                          </h4>
                          <p className={`text-xs ${isDarkMode ? 'text-emerald-200/70' : 'text-emerald-700/70'}`}>
                            You've mastered this material. Keep up the good work!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* RIGHT COLUMN: Sidebar (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Aggregate Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Best Score</p>
                  <p className="text-2xl font-bold">{bestAttempt.score}%</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Avg Score</p>
                  <p className="text-2xl font-bold">{avgScore}%</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Improvement</p>
                  <div className={`flex items-center gap-1 font-bold text-xl ${improvement >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <TrendingUp size={16} className={improvement < 0 ? 'rotate-180' : ''} />
                    {Math.abs(improvement)}%
                  </div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Pass Rate</p>
                  <p className="text-2xl font-bold">{passRate}%</p>
                </div>
              </div>

              {/* History List */}
              <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className={`px-5 py-3 border-b flex justify-between items-center ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
                  <h3 className="font-semibold text-sm">Attempt History</h3>
                </div>
                <div className={`max-h-[400px] overflow-y-auto ${isDarkMode ? 'divide-zinc-800' : 'divide-gray-100'} divide-y`}>
                  {attempts.map((attempt, idx) => (
                    <button
                      key={attempt.id}
                      onClick={() => setSelectedAttempt(attempt)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                        selectedAttempt?.id === attempt.id 
                          ? isDarkMode ? 'bg-zinc-800/50' : 'bg-indigo-50/50'
                          : isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          attempt.score >= test.passing_score 
                            ? isDarkMode ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                            : isDarkMode ? 'bg-rose-900/30 text-rose-400' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {attempt.score >= test.passing_score ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-zinc-200' : 'text-gray-900'}`}>
                            {new Date(attempt.completed_at).toLocaleDateString()}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                            {new Date(attempt.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${
                          attempt.score >= test.passing_score ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {attempt.score}%
                        </span>
                        <ChevronRight size={16} className={isDarkMode ? 'text-zinc-600' : 'text-gray-300'} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnterpriseResults;