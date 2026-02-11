import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ManageChallenges = () => {
  const { isDarkMode } = useDarkMode();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [centerId, setCenterId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly',
    targetValue: 10,
    rewardXp: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const centerRes = await axios.get(`${API_URL}/tutorial-centers/my-center`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (centerRes.data.center) {
        const cId = centerRes.data.center.id;
        setCenterId(cId);

        const res = await axios.get(`${API_URL}/gamification/challenges/center/${cId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setChallenges(res.data.challenges || []);
      }
    } catch (error) {
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/gamification/challenges`,
        { ...formData, centerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Challenge created!');
      setShowModal(false);
      loadChallenges();
      setFormData({
        title: '',
        description: '',
        type: 'weekly',
        targetValue: 10,
        rewardXp: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error('Failed to create challenge');
    }
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
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🎯 Manage Challenges
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition font-semibold"
          >
            + Create Challenge
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-2 rounded-xl p-6`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {ch.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {ch.description}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  ch.status === 'active' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {ch.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Type:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{ch.challenge_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Target:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{ch.target_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Reward:</span>
                  <span className="text-yellow-500">+{ch.reward_xp} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Participants:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {ch.challenge_participants?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Ends:</span>
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {new Date(ch.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-2 rounded-2xl p-8 max-w-md w-full`}>
              <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Create Challenge
              </h3>
              <form onSubmit={createChallenge} className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="special">Special</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Target Value
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.targetValue}
                      onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) })}
                      className={`w-full px-4 py-3 border-2 rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Reward XP
                  </label>
                  <input
                    type="number"
                    required
                    min="10"
                    step="10"
                    value={formData.rewardXp}
                    onChange={(e) => setFormData({ ...formData, rewardXp: parseInt(e.target.value) })}
                    className={`w-full px-4 py-3 border-2 rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition font-semibold"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={`flex-1 py-3 rounded-xl transition font-semibold ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageChallenges;
