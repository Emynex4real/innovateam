import React from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const WeeklyLeague = ({ league, rank, weeklyXP, participants = [] }) => {
  const { isDarkMode } = useDarkMode();

  const leagueConfig = {
    bronze: { color: 'from-orange-600 to-orange-800', icon: '🥉', next: 'Silver' },
    silver: { color: 'from-gray-400 to-gray-600', icon: '🥈', next: 'Gold' },
    gold: { color: 'from-yellow-400 to-yellow-600', icon: '🥇', next: 'Platinum' },
    platinum: { color: 'from-cyan-400 to-blue-600', icon: '💎', next: 'Diamond' },
    diamond: { color: 'from-purple-400 to-pink-600', icon: '💠', next: 'Legend' }
  };

  const config = leagueConfig[league?.toLowerCase()] || leagueConfig.bronze;
  const promotionZone = rank <= 3;
  const relegationZone = rank > 27;

  return (
    <div className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-lg'}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.color} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Weekly League</p>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              {config.icon} {league} League
            </h3>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black">#{rank}</p>
            <p className="text-xs opacity-90">Your Rank</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min((weeklyXP / 1000) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs mt-2 opacity-90">{weeklyXP} / 1000 XP this week</p>
      </div>

      {/* Promotion/Relegation Info */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
        {promotionZone ? (
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp className="w-5 h-5" />
            <p className="text-sm font-bold">Promotion Zone! Top 3 move to {config.next}</p>
          </div>
        ) : relegationZone ? (
          <div className="flex items-center gap-2 text-red-600">
            <TrendingDown className="w-5 h-5" />
            <p className="text-sm font-bold">Relegation Risk! Bottom 3 move down</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-600">
            <Minus className="w-5 h-5" />
            <p className="text-sm font-bold">Safe Zone - Keep pushing!</p>
          </div>
        )}
      </div>

      {/* Top 5 Participants */}
      <div className="p-4">
        <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Top Performers This Week
        </h4>
        <div className="space-y-2">
          {participants.slice(0, 5).map((p, idx) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-3 rounded-lg ${
                p.isYou 
                  ? isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                  : isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0 ? 'bg-yellow-400 text-white' :
                  idx === 1 ? 'bg-gray-400 text-white' :
                  idx === 2 ? 'bg-orange-400 text-white' :
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {idx + 1}
                </span>
                <div>
                  <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {p.name} {p.isYou && '(You)'}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Level {p.level}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{p.weeklyXP}</p>
                <p className="text-xs text-gray-500">XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
        <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          League resets every Monday at 00:00 UTC
        </p>
      </div>
    </div>
  );
};

export default WeeklyLeague;
