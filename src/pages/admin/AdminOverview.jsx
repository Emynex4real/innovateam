import React, { useState, useEffect } from "react";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { Card, CardContent } from "../../components/ui/card";
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import directSupabaseService from "../../services/directSupabase.service";
import { toast } from "react-toastify";

const StatCard = ({ title, value, icon: Icon, isDarkMode, subValue }) => (
  <Card
    className={`${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"} transition-all rounded-lg shadow-sm`}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`text-sm font-medium ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            {title}
          </p>
          <h3
            className={`text-2xl font-bold mt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            {value}
          </h3>
          {subValue && (
            <p className="text-xs text-green-500 mt-1 flex items-center">
              ↑ {subValue}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${isDarkMode ? "bg-zinc-800" : "bg-gray-100"}`}
        >
          <Icon
            className={`h-6 w-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminOverview = () => {
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsResult = await directSupabaseService.getDashboardStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      } else {
        console.error("Failed to load admin stats:", statsResult.error);
      }

      if (directSupabaseService.getChartData) {
        const chartResult = await directSupabaseService.getChartData();
        if (chartResult.success) setChartData(chartResult.chartData);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-6 md:p-8 min-h-[calc(100vh-4rem)] ${isDarkMode ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
          <p
            className={`mt-1 text-sm ${isDarkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            Welcome to the InnovaTeam administrative dashboard.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDarkMode
              ? "bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white"
              : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-700"
          }`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="space-y-6 animate-in fade-in duration-500 relative">
        {loading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-gray-950/50 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
            <RefreshCw size={32} className="animate-spin text-blue-500 mb-4" />
          </div>
        )}

        {/* Top 4 Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`₦${stats?.totalRevenue?.toLocaleString() || 0}`}
            icon={DollarSign}
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Transactions"
            value={stats?.totalTransactions || 0}
            icon={Activity}
            isDarkMode={isDarkMode}
          />
          <StatCard
            title="Active Today"
            value={stats?.activeToday || 0}
            icon={TrendingUp}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card
            className={`lg:col-span-7 rounded-lg shadow-sm ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}
          >
            <CardContent className="p-6">
              <h3
                className={`text-lg font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                Revenue Trends (Last 7 Days)
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDarkMode ? "#27272a" : "#f4f4f5"}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={isDarkMode ? "#71717a" : "#a1a1aa"}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={isDarkMode ? "#71717a" : "#a1a1aa"}
                      tickFormatter={(val) => `₦${val}`}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: isDarkMode ? "#27272a" : "#f4f4f5" }}
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
                        borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
                        borderRadius: "12px",
                        color: isDarkMode ? "#fff" : "#000",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                      formatter={(value) => [
                        `₦${value.toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`lg:col-span-5 rounded-lg shadow-sm ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}
          >
            <CardContent className="p-6">
              <h3
                className={`text-lg font-bold mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}
              >
                New Users (Last 7 Days)
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={isDarkMode ? "#27272a" : "#f4f4f5"}
                    />
                    <XAxis
                      dataKey="name"
                      stroke={isDarkMode ? "#71717a" : "#a1a1aa"}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={isDarkMode ? "#71717a" : "#a1a1aa"}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
                        borderColor: isDarkMode ? "#27272a" : "#e4e4e7",
                        borderRadius: "12px",
                        color: isDarkMode ? "#fff" : "#000",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#10b981"
                      strokeWidth={3}
                      activeDot={{ r: 8, strokeWidth: 0, fill: "#10b981" }}
                      dot={{
                        r: 4,
                        fill: isDarkMode ? "#18181b" : "#fff",
                        strokeWidth: 2,
                      }}
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
