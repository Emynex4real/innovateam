import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  TrendingUp, Target, Clock, Calendar, CheckCircle, 
  Award, Zap, BookOpen, BarChart2, ArrowRight 
} from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { motion } from 'framer-motion';

// --- Custom Components ---

const CircularProgress = ({ percentage, size = 120 }) => {
  const radius = 50;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle className="text-gray-100 dark:text-gray-800" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="50%" cy="50%" />
        <motion.circle 
          className="text-green-500" 
          strokeWidth="10" 
          strokeDasharray={circumference} 
          initial={{ strokeDashoffset: circumference }} 
          animate={{ strokeDashoffset: offset }} 
          transition={{ duration: 1.5, ease: "easeOut" }} 
          strokeLinecap="round" 
          stroke="currentColor" 
          fill="transparent" 
          r={radius} 
          cx="50%" 
          cy="50%" 
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
        <span className="text-[10px] uppercase font-bold text-gray-400">Score</span>
      </div>
    </div>
  );
};

const QUESTIONS_PER_LEVEL = 50;

const PerformanceAnalytics = () => {
  const { isDarkMode: isDark } = useDarkMode();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async () => {
    // 1. Get Current User
    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    } catch (error) {
      console.error('Failed to parse user data:', error);
      currentUser = {};
    }
    if (!currentUser.id) return;

    // 2. Get Data from Supabase (Real DB)
    let practiceHistory = [];
    let aiExamHistory = [];
    
    try {
      const supabase = (await import('../../config/supabase')).default;
      
      // Fetch Practice Sessions
      const { data: practiceData, error: practiceError } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (practiceError) throw practiceError;
      
      // Map Practice Sessions
      practiceHistory = (practiceData || []).map(s => ({
        bankName: s.bank_name,
        subject: s.subject,
        totalQuestions: s.total_questions,
        correctAnswers: s.correct_answers,
        timeSpent: s.time_spent,
        percentage: s.percentage,
        date: s.created_at,
        source: 'practice'
      }));

      // Fetch AI Examiner Sessions
      const { data: aiExamData, error: aiExamError } = await supabase
        .from('ai_exams')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      
      if (!aiExamError && aiExamData) {
        // Map AI Exams to same format
        aiExamHistory = aiExamData.map(exam => ({
          bankName: `AI Exam: ${exam.subject || 'Study Material'}`,
          subject: exam.subject || 'General',
          totalQuestions: exam.total_questions || 0,
          correctAnswers: exam.score || 0,
          timeSpent: 0, // AI exams don't track time currently
          percentage: exam.percentage || 0,
          date: exam.completed_at || exam.created_at,
          source: 'ai-examiner'
        }));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      practiceHistory = [];
      aiExamHistory = [];
    }

    // 3. Combine both data sources
    const allSessions = [...practiceHistory, ...aiExamHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    
    // 4. Calculate combined statistics
    const totalSessions = allSessions.length;
    const totalQuestions = allSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const correctAnswers = allSessions.reduce((sum, session) => sum + session.correctAnswers, 0);
    const totalTime = allSessions.reduce((sum, session) => sum + session.timeSpent, 0);
    
    const averageScore = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const averageTime = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0;

    // Streak Logic - Calculate consecutive days (unique dates only)
    let streak = 0;
    if (allSessions.length > 0) {
      const uniqueDates = [...new Set(allSessions.map(s => new Date(s.date).toDateString()))]
        .sort((a, b) => new Date(b) - new Date(a));
      
      const today = new Date().setHours(0, 0, 0, 0);
      let expectedDate = today;
      
      for (const dateStr of uniqueDates) {
        const sessionDate = new Date(dateStr).setHours(0, 0, 0, 0);
        if (sessionDate === expectedDate) {
          streak++;
          expectedDate -= 24 * 60 * 60 * 1000;
        } else if (sessionDate < expectedDate) {
          break;
        }
      }
    } 

    // Level Logic
    const level = Math.floor(correctAnswers / QUESTIONS_PER_LEVEL) + 1;
    const nextLevelProgress = ((correctAnswers % QUESTIONS_PER_LEVEL) / QUESTIONS_PER_LEVEL) * 100;

    // Subject Performance Logic
    const subjectStats = {};
    allSessions.forEach(session => {
      const sub = session.subject || 'General';
      if (!subjectStats[sub]) subjectStats[sub] = { total: 0, correct: 0 };
      subjectStats[sub].total += session.totalQuestions;
      subjectStats[sub].correct += session.correctAnswers;
    });

    const subjectPerformance = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      total: stats.total
    })).sort((a, b) => b.accuracy - a.accuracy).slice(0, 10);

    // Recent Sessions (Newest First) - Already sorted, take first 10
    const recentSessions = allSessions.slice(0, 5).map(s => ({
      bankName: s.bankName,
      date: s.date,
      score: s.percentage,
      total: s.totalQuestions,
      source: s.source
    }));

    setAnalytics({
      totalSessions,
      totalQuestions,
      averageScore,
      averageTime,
      streak,
      level,
      nextLevelProgress,
      subjectPerformance,
      recentSessions
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!analytics) {
    return (
      <div className={`min-h-screen p-8 flex items-center justify-center ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div>
           <h1 className="text-2xl font-bold mb-1">Performance Analytics</h1>
           <p className="text-gray-500 text-sm">Track your progress and learning stats.</p>
        </div>

        {/* 1. TOP STATS ROW (Matching Dashboard Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {/* Total Sessions */}
           <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-gray-500">Total Sessions</p>
                    <BookOpen className="w-5 h-5 text-gray-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalSessions}</h3>
                 <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Lifetime
                 </p>
              </CardContent>
           </Card>

           {/* Average Score */}
           <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-gray-500">Average Score</p>
                    <Target className="w-5 h-5 text-gray-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageScore}%</h3>
                 <p className="text-xs text-gray-400 mt-2 font-medium">Global Avg: 65%</p>
              </CardContent>
           </Card>

           {/* Current Streak */}
           <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-gray-500">Day Streak</p>
                    <Zap className="w-5 h-5 text-gray-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.streak} <span className="text-sm font-normal text-gray-400">days</span></h3>
                 <p className="text-xs text-green-600 mt-2 font-medium">Keep it going!</p>
              </CardContent>
           </Card>

           {/* Study Level */}
           <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-4">
                    <p className="text-sm font-medium text-gray-500">Study Level</p>
                    <Award className="w-5 h-5 text-gray-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Lvl {analytics.level}</h3>
                 <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${analytics.nextLevelProgress}%` }}></div>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* 2. OVERALL ACCURACY (Left Column) */}
           <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm md:col-span-1">
              <CardContent className="p-6">
                 <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">Accuracy Rate</h3>
                 <div className="flex justify-center py-6">
                    <CircularProgress percentage={analytics.averageScore} />
                 </div>
                 <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">Based on <span className="font-bold text-gray-900 dark:text-white">{analytics.totalQuestions}</span> questions</p>
                    <div className="flex justify-center gap-4 mt-4 text-xs font-medium text-gray-500">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Correct</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-200"></div> Wrong</span>
                    </div>
                 </div>
              </CardContent>
           </Card>

           {/* 3. SUBJECT PERFORMANCE (Right Column) */}
           <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm md:col-span-2">
              <CardContent className="p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Subject Mastery</h3>
                    <Button variant="outline" size="sm" className="h-8 text-xs">View All</Button>
                 </div>
                 <div className="space-y-6">
                    {analytics.subjectPerformance.length > 0 ? (
                      analytics.subjectPerformance.map((sub, i) => (
                         <div key={i}>
                            <div className="flex justify-between text-sm mb-2">
                               <span className="font-medium text-gray-700 dark:text-gray-200">{sub.subject}</span>
                               <span className="text-gray-500">{sub.accuracy}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${sub.accuracy}%` }}
                                 transition={{ delay: 0.1 * i }}
                                 className={`h-full rounded-full ${
                                   sub.accuracy >= 80 ? 'bg-green-500' : sub.accuracy >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                                 }`}
                               />
                            </div>
                         </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p>No study data available yet.</p>
                      </div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* 4. RECENT ACTIVITY LIST (Matching Dashboard Screenshot Style) */}
        <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
           <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Recent Sessions</h3>
              <div className="flex items-center gap-1 text-sm text-green-600 font-medium cursor-pointer hover:underline">
                 View All <ArrowRight className="w-4 h-4" />
              </div>
           </div>
           
           <div className="p-0">
              {analytics.recentSessions.length > 0 ? (
                analytics.recentSessions.map((session, i) => (
                   <div key={i} className="flex items-center justify-between p-6 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                         {/* Icon Circle (Matches Dashboard red/white style, but green for success) */}
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            session.score >= 60 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                         }`}>
                            {session.score >= 60 ? <CheckCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                         </div>
                         <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{session.bankName}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                              {session.source === 'ai-examiner' && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                                  AI
                                </Badge>
                              )}
                            </div>
                         </div>
                      </div>

                      {/* Right Side Info */}
                      <div className="text-right">
                         <p className={`font-bold text-sm mb-1 ${session.score >= 60 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                           {session.score}% Score
                         </p>
                         <Badge variant="secondary" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wide">
                            completed
                         </Badge>
                      </div>
                   </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                   <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                   <p>No recent activity found.</p>
                </div>
              )}
           </div>
        </Card>

      </div>
    </div>
  );
};

export default PerformanceAnalytics;