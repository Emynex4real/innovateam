import React, { useState, useEffect } from 'react';
import tutorialCenterService from '../services/tutorialCenter.service';

const LeagueCard = ({ centerId }) => {
  const [league, setLeague] = useState(null);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    loadLeague();
  }, [centerId]);

  const loadLeague = async () => {
    try {
      const response = await tutorialCenterService.getMyLeague(centerId);
      if (response.success) {
        setLeague(response.league);
        setRankings(response.rankings || []);
      }
    } catch (error) {
      console.error('Failed to load league');
    }
  };

  if (!league) return null;

  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 to-blue-600'
  };

  const tierEmojis = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎'
  };

  return (
    <div className={`bg-gradient-to-br ${tierColors[league.league_tier]} text-white rounded-lg shadow-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{tierEmojis[league.league_tier]}</span>
          <div>
            <h3 className="text-2xl font-bold capitalize">{league.league_tier} League</h3>
            <p className="text-sm opacity-90">Rank #{league.rank_in_league} of 50</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{league.weekly_points}</div>
          <div className="text-xs opacity-90">points</div>
        </div>
      </div>

      <div className="bg-white/20 rounded-lg p-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Weekly Progress</span>
          <span>{Math.min(100, Math.round((league.weekly_points / 1000) * 100))}%</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <div 
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${Math.min(100, (league.weekly_points / 1000) * 100)}%` }}
          />
        </div>
      </div>

      {rankings.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold opacity-90">Top 5 This Week</p>
          {rankings.slice(0, 5).map((r, idx) => (
            <div key={idx} className="flex justify-between text-sm bg-white/10 rounded px-2 py-1">
              <span>#{idx + 1} {r.student_name}</span>
              <span className="font-semibold">{r.weekly_points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeagueCard;
