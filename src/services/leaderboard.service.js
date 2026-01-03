import api from './api.service';

export const LeaderboardService = {
  // Public: Get general leaderboard
  getLeaderboard: async (timeframe = 'all', limit = 100) => {
    try {
      const response = await api.get(`/api/leaderboard?timeframe=${timeframe}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get Analytics
  getAnalytics: async () => {
    try {
      const response = await api.get('/api/leaderboard/analytics');
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get Top Performers
  getTopPerformers: async (period = 'weekly', limit = 10) => {
    try {
      const response = await api.get(`/api/leaderboard/top-performers?period=${period}&limit=${limit}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get History
  getHistory: async (snapshotType = '', limit = 30) => {
    try {
      let endpoint = `/api/leaderboard/history?limit=${limit}`;
      if (snapshotType) endpoint += `&snapshotType=${snapshotType}`;
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Create Snapshot
  createSnapshot: async (snapshotType) => {
    try {
      const response = await api.post('/api/leaderboard/snapshot', { snapshotType });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Award Top Performers
  awardTopPerformers: async (periodType, topCount = 3) => {
    try {
      const response = await api.post('/api/leaderboard/award-top', { periodType, topCount });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Reward Specific User
  rewardUser: async (data) => {
    try {
      const response = await api.post('/api/leaderboard/reward-user', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Bulk Award
  bulkAwardUsers: async (data) => {
    try {
      const response = await api.post('/api/leaderboard/bulk-award', data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Get User Rewards
  getUserRewards: async (userId) => {
    try {
      const response = await api.get(`/api/leaderboard/user-rewards/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};