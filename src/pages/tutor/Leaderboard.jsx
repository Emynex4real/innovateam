import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import tutorialCenterService from '../../services/tutorialCenter.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  Award, 
  Calendar, 
  Filter, 
  TrendingUp,
  Zap,
  Crown
} from 'lucide-react';

const EnhancedLeaderboard = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState('all'); // all, week, month
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [testId, filter]);

  const loadLeaderboard = async () => {
    try {
      const response = await tutorialCenterService.getLeaderboard(testId, filter);
      if (response.success) {
        setLeaderboard(response.leaderboard);
        setTestInfo(response.testInfo);
      }
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getTierInfo = (tier) => {
    const tiers = {
      bronze: { 
        color: 'text-orange-700', 
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: Award, 
        name: 'Bronze',
        minXP: 0
      },
      silver: { 
        color: 'text-slate-600', 
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        icon: Award, 
        name: 'Silver',
        minXP: 500
      },
      gold: { 
        color: 'text-yellow-700', 
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: Crown, 
        name: 'Gold',
        minXP: 1000
      },
      platinum: { 
        color: 'text-cyan-700', 
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        icon: Trophy, 
        name: 'Platinum',
        minXP: 2500
      },
      diamond: { 
        color: 'text-purple-700', 
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: Trophy, 
        name: 'Diamond',
        minXP: 5000
      }
    };
    return tiers[tier] || tiers.bronze;
  };

  const getRankDisplay = (rank) => {
    if (rank === 1) return { icon: Crown, color: 'text-yellow-500', fill: 'fill-yellow-500' };
    if (rank === 2) return { icon: Medal, color: 'text-slate-400', fill: 'fill-slate-400' };
    if (rank === 3) return { icon: Medal, color: 'text-orange-500', fill: 'fill-orange-500' };
    return { icon: null, color: isDarkMode ? 'text-gray-400' : 'text-gray-500', fill: 'none' };
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading rankings...</p>
      </div>
    );
  }

  // Helper for tier definitions array
  const tierDefinitions = [
    { key: 'bronze', ...getTierInfo('bronze') },
    { key: 'silver', ...getTierInfo('silver') },
    { key: 'gold', ...getTierInfo('gold') },
    { key: 'platinum', ...getTierInfo('platinum') },
    { key: 'diamond', ...getTierInfo('diamond') },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 text-sm font-medium mb-6 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
        >
          <ArrowLeft size={16} /> Back to Test
        </button>

        <div className={`rounded-xl border shadow-sm p-6 mb-8 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-50 text-yellow-600'}`}>
                  <Trophy size={24} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
              </div>
              <p className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {testInfo?.title || 'Test Rankings'}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              {[
                { id: 'all', label: 'All Time' },
                { id: 'month', label: 'This Month' },
                { id: 'week', label: 'This Week' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    filter === tab.id
                      ? isDarkMode 
                        ? 'bg-gray-700 text-white shadow-sm' 
                        : 'bg-white text-gray-900 shadow-sm'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Podium Section (Top 3) */}
        {leaderboard.length >= 3 && (
          <div className="mb-10">
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 h-auto md:h-64">
              
              {/* 2nd Place */}
              <div className="order-2 md:order-1 w-full md:w-64 flex flex-col items-center">
                <div className="mb-3 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-500 mb-2 border-4 border-white shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:border-gray-900">
                        <span className="font-bold text-lg">2</span>
                    </div>
                    <p className="font-bold truncate max-w-[150px]">{leaderboard[1].studentName}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{leaderboard[1].score}% Score</p>
                </div>
                <div className={`w-full h-32 md:h-40 rounded-t-xl bg-gradient-to-t from-slate-200 to-slate-50 border-t border-x border-slate-200 dark:from-slate-900 dark:to-slate-800 dark:border-slate-700 flex items-end justify-center pb-4`}>
                   <div className="text-slate-400 dark:text-slate-600">
                      <Medal size={48} />
                   </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2 w-full md:w-64 flex flex-col items-center">
                 <div className="mb-3 text-center">
                    <div className="relative">
                        <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-500 fill-yellow-500" size={24} />
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 mb-2 border-4 border-white shadow-sm dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-gray-900">
                            <span className="font-bold text-2xl">1</span>
                        </div>
                    </div>
                    <p className="font-bold text-lg truncate max-w-[180px]">{leaderboard[0].studentName}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{leaderboard[0].score}% Score</p>
                </div>
                <div className={`w-full h-40 md:h-56 rounded-t-xl bg-gradient-to-t from-yellow-200 to-yellow-50 border-t border-x border-yellow-200 dark:from-yellow-900/40 dark:to-yellow-900/10 dark:border-yellow-900/50 flex items-end justify-center pb-4 shadow-lg z-10`}>
                    <div className="text-yellow-500/50 dark:text-yellow-600/50">
                      <Trophy size={64} />
                   </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 md:order-3 w-full md:w-64 flex flex-col items-center">
                <div className="mb-3 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mb-2 border-4 border-white shadow-sm dark:bg-orange-900/30 dark:text-orange-400 dark:border-gray-900">
                        <span className="font-bold text-lg">3</span>
                    </div>
                    <p className="font-bold truncate max-w-[150px]">{leaderboard[2].studentName}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{leaderboard[2].score}% Score</p>
                </div>
                <div className={`w-full h-24 md:h-32 rounded-t-xl bg-gradient-to-t from-orange-200 to-orange-50 border-t border-x border-orange-200 dark:from-orange-900/40 dark:to-orange-900/10 dark:border-orange-900/50 flex items-end justify-center pb-4`}>
                   <div className="text-orange-400/50 dark:text-orange-600/50">
                      <Medal size={40} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'border-gray-800 text-gray-400 bg-gray-900' : 'border-gray-100 text-gray-500 bg-gray-50/50'}`}>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">XP</th>
                  <th className="px-6 py-4 text-center">Streak</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                {leaderboard.map((student, index) => {
                  const { icon: RankIcon, color: rankColor, fill: rankFill } = getRankDisplay(index + 1);
                  const tierInfo = getTierInfo(student.tier);
                  const TierIcon = tierInfo.icon;
                  const isTop3 = index < 3;
                  
                  return (
                    <tr 
                      key={student.studentId} 
                      className={`group transition-colors ${
                        isTop3 
                          ? isDarkMode ? 'bg-gray-800/30' : 'bg-amber-50/30' 
                          : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           {RankIcon ? (
                             <RankIcon size={20} className={`${rankColor} ${rankFill}`} />
                           ) : (
                             <span className="text-sm font-medium text-gray-500 w-5 text-center">#{index + 1}</span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {student.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{student.studentName}</p>
                            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Level {student.level}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                          isDarkMode 
                            ? `bg-gray-800 border-gray-700 ${tierInfo.color.replace('text-', 'text-opacity-80 text-')}`
                            : `${tierInfo.bgColor} ${tierInfo.borderColor} ${tierInfo.color}`
                        }`}>
                          <TierIcon size={12} />
                          {tierInfo.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-bold ${
                           student.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                           student.score >= 70 ? 'text-amber-600 dark:text-amber-400' :
                           'text-red-600 dark:text-red-400'
                        }`}>
                          {student.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`text-sm font-medium ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                           {student.xpPoints}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 text-sm font-medium text-orange-500">
                          <Zap size={14} fill="currentColor" />
                          {student.currentStreak}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {leaderboard.length === 0 && (
            <div className="text-center py-16">
              <div className={`p-4 rounded-full inline-block mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Trophy size={32} className="text-gray-400" />
              </div>
              <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>No rankings available yet</p>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Students need to complete the test to appear here.
              </p>
            </div>
          )}
        </div>

        {/* Tier Legend (Footer) */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
            {tierDefinitions.map((tier) => {
                const Icon = tier.icon;
                return (
                    <div key={tier.key} className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center ${
                        isDarkMode 
                        ? 'bg-gray-900 border-gray-800' 
                        : 'bg-white border-gray-200'
                    }`}>
                        <div className={`p-1.5 rounded-md mb-2 ${isDarkMode ? 'bg-gray-800' : tier.bgColor} ${tier.color}`}>
                            <Icon size={16} />
                        </div>
                        <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tier.name}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{tier.minXP}+ XP</span>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedLeaderboard;