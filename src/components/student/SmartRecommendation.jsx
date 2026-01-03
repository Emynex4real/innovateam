import React from 'react';
import { AlertTriangle, Target, Flame, TrendingUp, BookOpen, Zap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { gradients, shadows, cards } from '../../styles/designSystem';

const SmartRecommendation = ({ analytics, predictions }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const getRecommendation = () => {
    if (!analytics) return null;

    if (analytics.avgScore < 40) {
      return {
        type: 'emergency',
        icon: AlertTriangle,
        title: '⚠️ Emergency Review Required',
        message: `Your average score (${analytics.avgScore.toFixed(1)}%) needs immediate attention.`,
        action: 'Start Recovery Session',
        color: 'red',
        route: '/dashboard/practice-questions'
      };
    }

    if (analytics.currentStreak > 0 && analytics.lastActivityHours > 20) {
      return {
        type: 'streak',
        icon: Flame,
        title: '🔥 Protect Your Streak!',
        message: `You have a ${analytics.currentStreak}-day streak. Complete today's goal!`,
        action: 'Continue Streak',
        color: 'yellow',
        route: '/dashboard/practice-questions'
      };
    }

    if (analytics.avgScore > 70) {
      return {
        type: 'momentum',
        icon: TrendingUp,
        title: '🚀 You\'re On Fire!',
        message: 'Your scores are trending up! Keep the momentum going.',
        action: 'Take Challenge',
        color: 'green',
        route: '/dashboard/practice-questions'
      };
    }

    return {
      type: 'daily',
      icon: BookOpen,
      title: '📚 Daily Learning Goal',
      message: 'Complete 5 questions today to maintain your progress.',
      action: 'Start Practice',
      color: 'blue',
      route: '/dashboard/practice-questions'
    };
  };

  const rec = getRecommendation();
  if (!rec) return null;

  const colorClasses = {
    red: {
      bg: isDarkMode ? 'bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-800/50' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200',
      text: isDarkMode ? 'text-red-300' : 'text-red-700',
      button: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg shadow-red-500/30',
      icon: isDarkMode ? 'bg-red-900/50 text-red-400 shadow-lg shadow-red-500/20' : 'bg-red-100 text-red-600 shadow-lg shadow-red-500/20'
    },
    yellow: {
      bg: isDarkMode ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-800/50' : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200',
      text: isDarkMode ? 'text-yellow-300' : 'text-yellow-700',
      button: 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 shadow-lg shadow-yellow-500/30',
      icon: isDarkMode ? 'bg-yellow-900/50 text-yellow-400 shadow-lg shadow-yellow-500/20' : 'bg-yellow-100 text-yellow-600 shadow-lg shadow-yellow-500/20'
    },
    green: {
      bg: isDarkMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-800/50' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
      text: isDarkMode ? 'text-green-300' : 'text-green-700',
      button: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30',
      icon: isDarkMode ? 'bg-green-900/50 text-green-400 shadow-lg shadow-green-500/20' : 'bg-green-100 text-green-600 shadow-lg shadow-green-500/20'
    },
    blue: {
      bg: isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-800/50' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200',
      text: isDarkMode ? 'text-blue-300' : 'text-blue-700',
      button: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30',
      icon: isDarkMode ? 'bg-blue-900/50 text-blue-400 shadow-lg shadow-blue-500/20' : 'bg-blue-100 text-blue-600 shadow-lg shadow-blue-500/20'
    }
  };

  const colors = colorClasses[rec.color];
  const Icon = rec.icon;

  return (
    <div className={`${cards.elevated} overflow-hidden mb-6 group hover:scale-[1.02] transition-all duration-300`}>
      <div className={`${colors.bg} p-6 relative overflow-hidden`}>
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className={`p-4 rounded-2xl ${colors.icon} ${shadows.lg} group-hover:scale-110 transition-transform`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {rec.title}
              </h3>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
            <p className={`text-sm mb-4 leading-relaxed ${colors.text}`}>{rec.message}</p>
            <button
              onClick={() => navigate(rec.route)}
              className={`${colors.button} px-6 py-3 rounded-xl font-bold transition-all ${shadows.lg} hover:${shadows.xl} flex items-center gap-2 group/btn`}
            >
              <Zap className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
              {rec.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRecommendation;
