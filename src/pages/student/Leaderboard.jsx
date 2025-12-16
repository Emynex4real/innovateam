import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Trophy, Crown, Target, ChevronUp, Filter, Info, X, 
  Award, Zap, BookOpen, Flame, Calendar, Clock, Star
} from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import practiceSessionService from '../../services/practiceSession.service';
import { motion, AnimatePresence } from 'framer-motion';

// --- HELPER COMPONENTS (Moved outside for performance) ---

const Avatar = ({ name, rank, className = "w-10 h-10" }) => {
  const getColors = () => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-200';
    if (rank === 3) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900';
  };

  return (
    <div className={`${className} rounded-full border-2 flex items-center justify-center font-bold text-sm shadow-sm ${getColors()}`}>
      {name ? name.substring(0, 2).toUpperCase() : '??'}
    </div>
  );
};

const TopRankCard = ({ user, rank }) => {
  if (!user) return <div className="hidden md:block flex-1"></div>;
  const isFirst = rank === 1;

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-2xl border transition-all duration-300 ${
      isFirst 
        ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800 shadow-md transform -translate-y-4 z-10' 
        : 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800 mt-4 md:mt-0'
    }`}>
      {isFirst && (
        <div className="absolute -top-4 bg-yellow-400 text-white p-2 rounded-full shadow-lg">
          <Crown className="w-5 h-5" />
        </div>
      )}
      <Avatar name={user.name} rank={rank} className={`${isFirst ? 'w-20 h-20 text-2xl' : 'w-16 h-16 text-xl'} mb-4`} />
      <div className="text-center">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{user.name}</h3>
        <p className="text-sm text-gray-500 mb-3">{user.points.toLocaleString()} pts</p>
        <div className="flex items-center justify-center gap-2 text-xs font-medium bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
          <span className="flex items-center gap-1 text-green-600">
             <Target className="w-3 h-3" /> {user.averageScore}%
          </span>
        </div>
      </div>
      <div className={`absolute -bottom-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 text-white shadow-sm ${
         rank === 1 ? 'bg-yellow-400 border-yellow-200' : rank === 2 ? 'bg-gray-400 border-gray-200' : 'bg-orange-400 border-orange-200'
      }`}>
        {rank}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const Leaderboard = () => {
  const { isDarkMode: isDark } = useDarkMode();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'week', 'month'
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [weeklyChampion, setWeeklyChampion] = useState(null);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    loadLeaderboardData();
  }, [timeframe]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      // Fetch Leaderboard List AND Weekly Champion simultaneously
      const [listResult, championResult] = await Promise.all([
        practiceSessionService.getLeaderboard(timeframe, 100),
        practiceSessionService.getWeeklyChampion()
      ]);
      
      if (listResult.success) {
        // Format data safely
        const formattedData = listResult.data
          .filter(u => u.points > 0)
          .map(user => ({
            id: user.user_id,
            name: user.name || 'Anonymous',
            averageScore: user.average_score || 0,
            points: user.points || 0,
            level: user.level || 1,
            streak: user.streak || 0,
            rank: user.rank,
            isCurrentUser: user.isCurrentUser
          }));
        setLeaderboard(formattedData);
        setCurrentUserRank(formattedData.find(u => u.isCurrentUser));
      }

      if (championResult.success && championResult.champion) {
        setWeeklyChampion(championResult.champion);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className={`min-h-screen p-8 flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-7 h-7 text-yellow-500" />
              <h1 className="text-2xl font-bold mb-1">Leaderboard</h1>
              <button onClick={() => setShowRules(true)} className="text-gray-400 hover:text-green-600 transition-colors">
                <Info className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-500 text-sm">Compete with other students and climb the ranks!</p>
          </div>

          {/* Timeframe Filter */}
          <div className="bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-100 dark:border-gray-800 flex shadow-sm">
             {['all', 'week', 'month'].map((t) => (
               <button
                 key={t}
                 onClick={() => setTimeframe(t)}
                 className={`px-6 py-2 rounded-md text-sm font-medium capitalize transition-all flex items-center gap-2 ${
                   timeframe === t 
                     ? 'bg-green-600 text-white shadow-md' 
                     : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                 }`}
               >
                 {t === 'week' && <Clock className="w-4 h-4" />}
                 {t === 'month' && <Calendar className="w-4 h-4" />}
                 {t === 'all' && <Star className="w-4 h-4" />}
                 {t === 'all' ? 'All Time' : t}
               </button>
             ))}
          </div>
        </div>

        {/* Dynamic "Performer of the Week" Banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
               <Crown className="w-32 h-32 text-yellow-600" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-800">
                <Crown className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Performer of the Week
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] h-5">
                    CURRENT
                  </Badge>
                </h3>
                {weeklyChampion ? (
                   <p className="text-sm text-gray-600 dark:text-gray-300">
                     <span className="font-bold text-gray-900 dark:text-white">{weeklyChampion.name}</span> is leading with <span className="font-bold text-green-600">{weeklyChampion.points.toLocaleString()} XP</span>!
                   </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Be the first to take the lead this week!
                  </p>
                )}
              </div>
              {weeklyChampion && (
                 <Avatar name={weeklyChampion.name} rank={1} className="w-12 h-12 text-lg border-4 border-white dark:border-gray-800" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Top 3 Podium & Full List */}
        {leaderboard.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-3xl mx-auto mb-8 pt-8 md:pt-0">
               <TopRankCard user={leaderboard[1]} rank={2} />
               <TopRankCard user={leaderboard[0]} rank={1} />
               <TopRankCard user={leaderboard[2]} rank={3} />
            </div>

            <Card className="border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm bg-white dark:bg-gray-900">
               <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center rounded-t-xl">
                  <div className="flex items-center gap-2">
                     <Filter className="w-4 h-4 text-gray-400" />
                     <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                        {timeframe === 'all' ? 'All Time' : timeframe === 'week' ? 'Weekly' : 'Monthly'} Rankings
                     </span>
                  </div>
                  <Badge variant="outline" className="text-xs font-normal text-gray-500 border-gray-200">
                    {leaderboard.length} Students
                  </Badge>
               </div>
               
               <div className="divide-y divide-gray-100 dark:divide-gray-800">
                 {leaderboard.slice(3).map((user) => (
                   <motion.div 
                     initial={{ opacity: 0 }}
                     whileInView={{ opacity: 1 }}
                     viewport={{ once: true }}
                     key={user.id} 
                     className={`p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                       user.isCurrentUser ? 'bg-green-50/40 dark:bg-green-900/10' : ''
                     }`}
                   >
                      <div className="flex items-center gap-4">
                         <span className="w-8 text-center font-bold text-gray-400 text-sm">#{user.rank}</span>
                         <div className="flex items-center gap-3">
                            <Avatar name={user.name} rank={user.rank} className="w-10 h-10 text-xs" />
                            <div>
                               <p className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                 {user.name}
                                 {user.isCurrentUser && (
                                   <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px] h-5 px-1.5">YOU</Badge>
                                 )}
                               </p>
                               <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                 <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Lv {user.level}</span>
                                 <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                 <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" /> {user.streak}d</span>
                               </p>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="font-bold text-green-600 dark:text-green-400 text-sm">{user.points.toLocaleString()}</p>
                         <p className="text-[10px] uppercase font-bold text-gray-400">XP</p>
                      </div>
                   </motion.div>
                 ))}
               </div>
            </Card>
          </>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No rankings available yet.</p>
          </div>
        )}
      </div>

      {/* Sticky User Stats */}
      <AnimatePresence>
        {currentUserRank && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4"
          >
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between ring-1 ring-black/5">
               <div className="flex items-center gap-3">
                  <div className="bg-green-600 text-white w-10 h-10 rounded-lg flex flex-col items-center justify-center shadow-md shadow-green-200 dark:shadow-none">
                     <ChevronUp className="w-3 h-3" />
                     <span className="text-xs font-bold leading-none">#{currentUserRank.rank}</span>
                  </div>
                  <div>
                     <p className="text-sm font-bold text-gray-900 dark:text-white">Your Ranking</p>
                     <p className="text-xs text-gray-500">Top {Math.max(1, Math.round((currentUserRank.rank / leaderboard.length) * 100))}%</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{currentUserRank.points.toLocaleString()}</p>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Points</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 relative"
            >
              <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">How Points Work</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Award className="w-5 h-5 text-green-600 mt-0.5" />
                  <div><p className="font-bold text-gray-900 dark:text-white">10 points</p><p className="text-sm text-gray-500">For every correct answer.</p></div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div><p className="font-bold text-gray-900 dark:text-white">50 points</p><p className="text-sm text-gray-500">Bonus for completing a session.</p></div>
                </div>
              </div>
              <button onClick={() => setShowRules(false)} className="w-full mt-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors">Got it!</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;