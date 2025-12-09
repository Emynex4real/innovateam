import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Trophy, Crown, Award, TrendingUp, Users, Calendar,
  Gift, Zap, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LeaderboardService } from '../../services/leaderboard.service'; // Import the service

const AdminLeaderboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [topPerformers, setTopPerformers] = useState({ daily: [], weekly: [], monthly: [], yearly: [] });
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use LeaderboardService instead of axios
      const [analyticsRes, dailyRes, weeklyRes, monthlyRes, yearlyRes] = await Promise.all([
        LeaderboardService.getAnalytics(),
        LeaderboardService.getTopPerformers('daily', 10),
        LeaderboardService.getTopPerformers('weekly', 10),
        LeaderboardService.getTopPerformers('monthly', 10),
        LeaderboardService.getTopPerformers('yearly', 10)
      ]);

      // Note: Service returns the body directly, so we use .data instead of .data.data
      setAnalytics(analyticsRes.data);
      setTopPerformers({
        daily: dailyRes.data || [],
        weekly: weeklyRes.data || [],
        monthly: monthlyRes.data || [],
        yearly: yearlyRes.data || []
      });
    } catch (error) {
      console.error('Load data error:', error);
      toast.error('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const createSnapshot = async (type) => {
    try {
      setLoading(true);
      const res = await LeaderboardService.createSnapshot(type);
      toast.success(res.message || "Snapshot created");
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to create snapshot');
    } finally {
      setLoading(false);
    }
  };

  const awardTopPerformers = async (periodType, topCount = 3) => {
    try {
      setLoading(true);
      const res = await LeaderboardService.awardTopPerformers(periodType, topCount);
      toast.success(`✨ ${res.message}`);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to award performers');
    } finally {
      setLoading(false);
    }
  };

  const rewardUser = async (userId, rewardTitle, pointsBonus) => {
    try {
      await LeaderboardService.rewardUser({
        userId,
        rewardType: 'achievement',
        rewardTitle,
        rewardDescription: `Awarded by admin for outstanding performance`,
        pointsBonus
      });
      toast.success(`🎁 Reward sent!`);
    } catch (error) {
      toast.error(error.message || 'Failed to send reward');
    }
  };

  const bulkAwardSelected = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    try {
      setLoading(true);
      await LeaderboardService.bulkAwardUsers({
        userIds: selectedUsers,
        rewardTitle: '🌟 Special Recognition',
        rewardDescription: 'Awarded for exceptional performance',
        pointsBonus: 100
      });
      toast.success(`Rewarded ${selectedUsers.length} users!`);
      setSelectedUsers([]);
    } catch (error) {
      toast.error(error.message || 'Failed to bulk award');
    } finally {
      setLoading(false);
    }
  };

  const currentPerformers = topPerformers[selectedPeriod] || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard Management
          </h1>
          <p className="text-gray-500 mt-1">Monitor, reward, and manage top performers</p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Users Today</p>
                  <h3 className="text-2xl font-bold">{analytics.active_users_today || 0}</h3>
                  <p className="text-xs text-green-500 mt-1">
                    {analytics.total_sessions_today || 0} sessions
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Points Awarded Today</p>
                  <h3 className="text-2xl font-bold">{analytics.total_points_awarded_today?.toLocaleString() || 0}</h3>
                  <p className="text-xs text-purple-500 mt-1">
                    Avg: {analytics.avg_score_today || 0}%
                  </p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rewards Given Today</p>
                  <h3 className="text-2xl font-bold">{analytics.rewards_given_today || 0}</h3>
                  <p className="text-xs text-green-500 mt-1">
                    {analytics.unique_exams_today || 0} unique exams
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active This Week</p>
                  <h3 className="text-2xl font-bold">{analytics.active_users_week || 0}</h3>
                  <p className="text-xs text-orange-500 mt-1">
                    Month: {analytics.active_users_month || 0}
                  </p>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={() => createSnapshot('daily')} disabled={loading} className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Daily Snapshot
            </Button>
            <Button onClick={() => createSnapshot('weekly')} disabled={loading} className="w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Weekly Snapshot
            </Button>
            <Button onClick={() => awardTopPerformers('weekly', 3)} disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-700">
              <Crown className="w-4 h-4 mr-2" />
              Award Top 3
            </Button>
            <Button onClick={bulkAwardSelected} disabled={loading || selectedUsers.length === 0} className="w-full bg-purple-600 hover:bg-purple-700">
              <Gift className="w-4 h-4 mr-2" />
              Bulk Reward ({selectedUsers.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <div className="flex gap-2">
              {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
                <Button
                  key={period}
                  size="sm"
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  onClick={() => setSelectedPeriod(period)}
                  className="capitalize"
                >
                  {period}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentPerformers.map((user, index) => (
              <div
                key={user.user_id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  selectedUsers.includes(user.user_id) ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.user_id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.user_id]);
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.user_id));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-green-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Points</p>
                    <p className="font-bold text-green-600">{user.points?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Exams</p>
                    <p className="font-bold">{user.unique_exams_attempted || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Avg Score</p>
                    <p className="font-bold">{user.average_score || 0}%</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => rewardUser(user.user_id, `${selectedPeriod} Top Performer`, 200)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Reward
                  </Button>
                </div>
              </div>
            ))}

            {currentPerformers.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No data available for this period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeaderboard;