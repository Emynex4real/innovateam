import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Badges = () => {
  const { isDarkMode } = useDarkMode();
  const [myBadges, setMyBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const token = localStorage.getItem('token');
      const [myRes, allRes] = await Promise.all([
        axios.get(`${API_URL}/gamification/badges/my`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/gamification/badges/all`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMyBadges(myRes.data.badges || []);
      setAllBadges(allRes.data.badges || []);
    } catch (error) {
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const hasBadge = (badgeCode) => {
    return myBadges.some(b => b.badge_code === badgeCode);
  };

  const getBadgeIcon = (category) => {
    const icons = {
      achievement: '🏆',
      streak: '🔥',
      mastery: '⭐',
      social: '👥',
      special: '💎'
    };
    return icons[category] || '🎖️';
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🏆 Badge Collection
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {myBadges.length} of {allBadges.length} badges earned
          </p>
        </div>

        {/* Earned Badges */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Earned Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myBadges.map((badge) => (
              <div
                key={badge.id}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6 shadow-lg`}
              >
                <div className="text-center">
                  <div className="text-6xl mb-3">{getBadgeIcon(badge.badges.category)}</div>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {badge.badges.name}
                  </h3>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {badge.badges.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className="text-yellow-500">+{badge.badges.xp_reward} XP</span>
                    <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>•</span>
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {new Date(badge.earned_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locked Badges */}
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Locked Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allBadges
              .filter(badge => !hasBadge(badge.code))
              .map((badge) => (
                <div
                  key={badge.id}
                  className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100 border-gray-300'} border-2 rounded-xl p-6 opacity-60`}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-3 grayscale">{getBadgeIcon(badge.category)}</div>
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {badge.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      🔒 {badge.criteria}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Badges;
