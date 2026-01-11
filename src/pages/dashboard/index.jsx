import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Zap,
  Target,
  AlertCircle,
  X,
  CheckCircle2,
  ChevronRight,
  Crown,
  Play,
  History,
  TrendingUp,
  BarChart3,
  Bot,
  FileText,
  Medal,
  ArrowRight,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "../../App";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { useWallet } from "../../contexts/WalletContext";
import PaymentModal from "../../components/PaymentModal";
import practiceSessionService from "../../services/practiceSession.service";

const AI_TOOLS = [
  {
    id: "practice",
    title: "Smart Prep",
    subtitle: "Practice Questions",
    desc: "Generate custom CBT drills instantly.",
    icon: Target,
    color: "bg-emerald-500",
    gradient: "from-emerald-500/20 to-teal-500/20",
    link: "/dashboard/practice-questions",
    btnText: "Start Drill",
  },
  {
    id: "examiner",
    title: "The Examiner",
    subtitle: "AI Assessment",
    desc: "Deep theory grading & analysis.",
    icon: FileText,
    color: "bg-indigo-500",
    gradient: "from-indigo-500/20 to-blue-500/20",
    link: "/dashboard/ai-examiner",
    btnText: "Take Exam",
  },
  {
    id: "tutorial",
    title: "Tutorial Center",
    subtitle: "Practice Tests",
    desc: "Join centers & take tests from tutors.",
    icon: Brain,
    color: "bg-blue-500",
    gradient: "from-blue-500/20 to-cyan-500/20",
    link: null, // Dynamic based on role
    btnText: "Browse Tests",
  },
  {
    id: "advisor",
    title: "Pathfinder AI",
    subtitle: "Course Advisor",
    desc: "Find your perfect admission path.",
    icon: Compass,
    color: "bg-violet-500",
    gradient: "from-violet-500/20 to-fuchsia-500/20",
    link: "/dashboard/course-advisor",
    btnText: "Ask AI",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(true);
  const [userRole, setUserRole] = useState('student');
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({
    totalSessions: 0,
    averageScore: 0,
    streak: 0,
    level: 1,
    progress: 0,
    totalQuestions: 0,
    chartData: [],
    hasPracticedToday: false,
  });

  const { user } = useAuth();
  const { walletBalance, getRecentTransactions } = useWallet();
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    const fetchUserRole = async () => {
      // console.log('🔍 [Dashboard] Fetching user role for:', user?.id);
      if (user?.id) {
        const supabase = (await import('../../config/supabase')).default;
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role, is_admin')
          .eq('id', user.id)
          .single();
        
        // console.log('🔍 [Dashboard] Profile data:', profile);
        // console.log('🔍 [Dashboard] Profile error:', error);
        
        const role = profile?.role || 'student';
        const admin = profile?.is_admin || profile?.role === 'admin';
        
        // console.log('🔍 [Dashboard] Computed role:', role);
        // console.log('🔍 [Dashboard] Is admin:', admin);
        
        setUserRole(role);
        setIsAdmin(admin);
      }
    };
    fetchUserRole();
  }, [user?.id]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (user?.id) {
        setLoading(true);
        await new Promise((r) => setTimeout(r, 600));
        const result = await practiceSessionService.getStudentProgress(user.id);
        if (result.success) setProgressData(result.stats);
        setLoading(false);
      }
    };
    fetchProgress();
  }, [user?.id]);

  const quests = [
    {
      title: "Smart Prep Session",
      desc: "Complete 1 drill",
      xp: "50 XP",
      done: progressData.hasPracticedToday,
    },
    {
      title: "Consult Pathfinder",
      desc: "Check admission chances",
      xp: "30 XP",
      done: false,
    },
    {
      title: "Top 10%",
      desc: "Reach leaderboard top 10",
      xp: "Badge",
      done: false,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8 space-y-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <span className="bg-gradient-to-r from-emerald-600/90 to-teal-600/90 bg-clip-text text-transparent">
                  Dashboard
                </span>
                {/* <span className="text-2xl">🚀</span> */}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                Let's crush some goals,{" "}
                {user?.user_metadata?.full_name?.split(" ")[0] || "Scholar"}.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <Link to="/dashboard/leaderboard">
                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 px-3 sm:px-4 py-1.5 rounded-full text-sm font-bold border border-yellow-200 dark:border-yellow-900 cursor-pointer hover:scale-105 transition-transform">
                  <Medal className="w-4 h-4 fill-current" />
                  Rank #{loading ? "..." : "124"}
                </div>
              </Link>
              <div className="flex items-center gap-2 bg-teal-50 dark:bg-emerald-950/30 text-emerald-600/90 dark:to-teal-600/90  px-3 sm:px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-200 dark:border-teal-900">
                <Zap className="w-4 h-4 fill-current" />
                {progressData.streak} Day Streak
              </div>
            </div>
          </div>
        </div>

        {/* Low Credit Warning */}
        {walletBalance < 500 && showLowBalanceAlert && (
          <motion.div
            variants={itemVariants}
            className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-red-900 dark:text-red-200 text-sm">
                  Credits Low (₦{walletBalance.toLocaleString()})
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  You need credits to use AI tools.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowPaymentModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
            >
              Refill Now
            </Button>
          </motion.div>
        )}

        {/* Admin Panel Link */}
        {/* {isAdmin && (
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl font-bold">Admin Access</h3>
                <p className="text-purple-100 text-sm">Manage users, settings, and system configuration</p>
              </div>
            </div>
            <Link to="/admin/dashboard">
              <Button className="bg-white text-purple-600 hover:bg-purple-50 font-bold h-12 px-6 rounded-xl shadow-xl">
                Open Admin Panel <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        )} */}

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Hero */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-8 relative group overflow-hidden rounded-[2rem] bg-slate-900 dark:bg-black text-white shadow-2xl ring-1 ring-slate-900/5 min-h-[280px] flex flex-col justify-between p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute -right-16 -bottom-24 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <Brain className="h-80 w-80 text-white" />
            </div>
            <div className="relative z-10">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-none mb-4 backdrop-blur-md px-3 py-1">
                Recommended for you
              </Badge>
              <h2 className="text-4xl font-extrabold tracking-tight mb-3 leading-tight">
                Time to level up. <br /> Start a Smart Drill?
              </h2>
              <p className="text-emerald-100 max-w-md font-medium text-sm md:text-base">
                Your AI has analyzed your history. We recommend a 20-minute
                speed drill.
              </p>
            </div>
            <div className="relative z-10 flex gap-4 mt-8">
              <Link
                to="/dashboard/practice-questions"
                className="flex-1 sm:flex-none"
              >
                <Button className="w-full sm:w-auto bg-white text-emerald-700 hover:bg-emerald-50 font-bold h-12 rounded-xl shadow-xl shadow-black/20 text-base px-8">
                  <Play className="mr-2 h-5 w-5 fill-current" /> Start Session
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Wallet */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-4 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex justify-between items-start relative z-10">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white group-hover:scale-110 transition-transform shadow-sm">
                <Zap className="h-6 w-6 fill-orange-500 text-orange-500" />
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                CREDITS
              </Badge>
            </div>
            <div className="relative z-10">
              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-4">
                {loading ? (
                  <div className="h-10 w-32 bg-slate-100 rounded animate-pulse" />
                ) : (
                  `₦${(walletBalance || 0).toLocaleString()}`
                )}
              </h3>
              <p className="text-slate-400 text-xs font-medium mt-1">
                Available for AI Tools
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold h-10 rounded-xl hover:scale-[1.02] transition-transform"
                >
                  Top Up Wallet
                </Button>
              </div>
            </div>
          </motion.div>

          {/* AI Tools */}
          <div className="md:col-span-12">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> Your AI Arsenal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {AI_TOOLS.map((tool) => {
                // Dynamic link for tutorial center based on role
                const toolLink = tool.id === 'tutorial' 
                  ? (userRole === 'tutor' || userRole === 'admin' ? '/tutor' : '/student/dashboard')
                  : tool.link;
                
                return (
                  <Link to={toolLink} key={tool.id} className="block h-full">
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className="h-full p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group relative overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                    <div className="relative z-10 flex flex-col h-full">
                      <div
                        className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <tool.icon className="h-7 w-7" />
                      </div>
                      <div className="mb-auto">
                        <h4 className="font-bold text-xl text-slate-900 dark:text-white">
                          {tool.title}
                        </h4>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mt-1">
                          {tool.subtitle}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                        {tool.btnText}{" "}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
              })}
            </div>
          </div>

          {/* Performance Chart */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" /> Performance
                  Analytics
                </h3>
                <p className="text-sm text-slate-500">
                  Your learning curve over the last 7 days
                </p>
              </div>
              <Link to="/dashboard/analytics">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full px-4 border-slate-200"
                >
                  Full Analytics <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="h-[200px] w-full">
              {loading ? (
                <div className="h-full w-full bg-slate-50 dark:bg-slate-800 animate-pulse rounded-xl" />
              ) : progressData.chartData.every((d) => d.score === 0) ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">
                    No tests taken yet
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData.chartData}>
                    <defs>
                      <linearGradient
                        id="mainChart"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        backgroundColor: "#fff",
                      }}
                      cursor={{ stroke: "#8b5cf6", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fill="url(#mainChart)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Leaderboard Preview */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-4 bg-gradient-to-b from-slate-900 to-indigo-950 rounded-[2rem] shadow-xl p-8 text-white relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Leaderboard</h3>
                  <p className="text-indigo-200 text-xs">
                    Top performers this week
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                  >
                    <span className="font-bold text-yellow-400 w-6">#{i}</span>
                    <div className="h-8 w-8 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="h-2 w-20 bg-white/20 rounded mb-1" />
                      <div className="h-1.5 w-12 bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/dashboard/leaderboard" className="relative z-10 mt-6">
              <Button className="w-full bg-white text-indigo-950 hover:bg-indigo-50 font-bold h-12 rounded-xl">
                View Rankings
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4 pl-1">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Activity Log
            </h3>
            <Link
              to="/dashboard/transactions"
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-8 text-center">
                <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : getRecentTransactions(3).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                <History className="h-8 w-8 opacity-20" />
                No activity yet.
              </div>
            ) : (
              getRecentTransactions(3).map((tx) => (
                <div
                  key={tx.id}
                  className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors first:rounded-t-[2rem] last:rounded-b-[2rem]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === "credit"
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <Sparkles className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">
                        {tx.description || tx.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(tx.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold text-sm ${
                      tx.type === "credit"
                        ? "text-emerald-600"
                        : "text-slate-900 dark:text-slate-300"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}₦
                    {Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => setShowPaymentModal(false)}
      />
    </div>
  );
};

export default Dashboard;
