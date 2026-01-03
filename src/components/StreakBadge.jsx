import React, { useState, useEffect } from 'react';
import tutorialCenterService from '../services/tutorialCenter.service';

const StreakBadge = ({ centerId }) => {
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    loadStreak();
  }, [centerId]);

  const loadStreak = async () => {
    try {
      const response = await tutorialCenterService.getMyStreak(centerId);
      if (response.success) {
        setStreak(response.streak);
      }
    } catch (error) {
      console.error('Failed to load streak');
    }
  };

  if (!streak) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-lg">
      <span className="text-2xl">🔥</span>
      <div>
        <div className="font-bold text-lg">{streak.current_streak} Day Streak!</div>
        <div className="text-xs opacity-90">Best: {streak.longest_streak} days</div>
      </div>
    </div>
  );
};

export default StreakBadge;
