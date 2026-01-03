import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Challenges = () => {
  const { isDarkMode } = useDarkMode();
  const [myChallenges, setMyChallenges] = useState([]);
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [centerId, setCenterId] = useState(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get enrolled center
      const enrollRes = await axios.get(`${API_URL}/tc-enrollments/my-enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (enrollRes.data.enrollments?.[0]) {
        const cId = enrollRes.data.enrollments[0].center_id;
        setCenterId(cId);

        const [myRes, availRes] = await Promise.all([
          axios.get(`${API_URL}/gamification/challenges/my`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/gamification/challenges/center/${cId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setMyChallenges(myRes.data.challenges || []);
        setAvailableChallenges(availRes.data.challenges || []);
      }
    } catch (error) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/gamification/challenges/${challengeId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Challenge joined!');
      loadChallenges();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join challenge');
    }
  };

  const getChallengeIcon = (type) => {
    const icons = {
      daily: '📅',
      weekly: '📆',
      monthly: '🗓️',
      special: '⭐'
    };
    return icons[type] || '🎯';
  };

  const getProgressPercent = (progress, target) => {
    return Math.min((progress / target) * 100, 100);
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
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🎯 Challenges
        </h1>

        {/* My Challenges */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            My Active Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myChallenges.map((ch) => (
              <div
                key={ch.id}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getChallengeIcon(ch.challenges.challenge_type)}</span>
                    <div>
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {ch.challenges.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {ch.challenges.description}
                      </p>
                    </div>
                  </div>
                  {ch.completed && <span className="text-2xl">✅</span>}
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {ch.progress} / {ch.challenges.target_value}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${getProgressPercent(ch.progress, ch.challenges.target_value)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-500">🏆 +{ch.challenges.reward_xp} XP</span>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Ends: {new Date(ch.challenges.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Challenges */}
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Available Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableChallenges
              .filter(ch => !myChallenges.some(m => m.challenge_id === ch.id))
              .map((ch) => (
                <div
                  key={ch.id}
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-4xl">{getChallengeIcon(ch.challenge_type)}</span>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {ch.title}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {ch.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-yellow-500">🏆 +{ch.reward_xp} XP</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Target: {ch.target_value}
                    </span>
                  </div>

                  <button
                    onClick={() => joinChallenge(ch.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold"
                  >
                    Join Challenge
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
