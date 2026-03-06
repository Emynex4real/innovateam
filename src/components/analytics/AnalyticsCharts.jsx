import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { AlertTriangle, TrendingUp, Target } from "lucide-react";

export const ScoreTrendChart = ({ data, days = 30, primaryColor }) => {
  const { isDarkMode } = useDarkMode();

  if (!data || data.length === 0) {
    return (
      <div
        className={`h-64 flex items-center justify-center rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
      >
        <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
          No data available
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={primaryColor || "#10b981"}
              stopOpacity={0.4}
            />
            <stop
              offset="95%"
              stopColor={primaryColor || "#10b981"}
              stopOpacity={0.0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={isDarkMode ? "#27272a" : "#f3f4f6"}
        />
        <XAxis
          dataKey="date"
          stroke={isDarkMode ? "#71717a" : "#a1a1aa"}
          style={{ fontSize: "11px", fontWeight: 500 }}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke={isDarkMode ? "#71717a" : "#a1a1aa"}
          style={{ fontSize: "11px", fontWeight: 500 }}
          domain={[0, 100]}
          tickLine={false}
          axisLine={false}
          dx={-10}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDarkMode ? "#18181b" : "#ffffff",
            border: `1px solid ${isDarkMode ? "#27272a" : "#e5e7eb"}`,
            borderRadius: "12px",
            boxShadow:
              "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            padding: "12px",
          }}
          itemStyle={{ color: primaryColor || "#10b981", fontWeight: "bold" }}
          labelStyle={{
            color: isDarkMode ? "#a1a1aa" : "#71717a",
            marginBottom: "4px",
            fontSize: "12px",
          }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke={primaryColor || "#10b981"}
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorScore)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const TopicMasteryHeatmap = ({ data, primaryColor }) => {
  const { isDarkMode } = useDarkMode();

  const getColor = (mastery) => {
    if (mastery >= 80) return isDarkMode ? "bg-green-500" : "bg-green-500";
    if (mastery >= 60) return isDarkMode ? "bg-amber-500" : "bg-amber-500";
    if (mastery >= 40) return isDarkMode ? "bg-orange-500" : "bg-orange-500";
    return isDarkMode ? "bg-red-500" : "bg-red-500";
  };

  const getTextColor = (mastery) => {
    if (mastery >= 80) return "text-green-600 dark:text-green-400";
    if (mastery >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (mastery >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-4">
      {data.map((topic, idx) => (
        <div key={idx} className="group">
          <div className="flex items-center justify-between mb-1.5">
            <h4
              className={`font-semibold text-sm ${isDarkMode ? "text-zinc-200" : "text-gray-800"}`}
            >
              {topic.subject}
            </h4>
            <span
              className={`text-sm font-bold ${getTextColor(topic.mastery || topic.avgScore)}`}
            >
              {topic.mastery || topic.avgScore}%
            </span>
          </div>
          <div
            className={`w-full h-2 rounded-full ${isDarkMode ? "bg-zinc-800" : "bg-gray-100"} overflow-hidden`}
          >
            <div
              className={`h-full ${getColor(topic.mastery || topic.avgScore)} transition-all duration-1000 ease-out`}
              style={{ width: `${topic.mastery || topic.avgScore}%` }}
            />
          </div>
          <div
            className={`text-xs mt-1.5 font-medium flex justify-between ${isDarkMode ? "text-zinc-500" : "text-gray-500"}`}
          >
            <span>
              {topic.correctAnswers || 0}/{topic.totalQuestions || 0} Correct
            </span>
            <span>{topic.accuracy || topic.avgScore}% Accuracy</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AtRiskIndicator = ({ riskScore, riskLevel }) => {
  const { isDarkMode } = useDarkMode();

  const getRiskDetails = () => {
    if (riskLevel === "critical")
      return {
        color: "text-red-600 dark:text-red-400",
        bgClass: isDarkMode
          ? "bg-red-500/10 border-red-500/20"
          : "bg-red-50 border-red-100",
        label: "Critical Status",
        message: "Immediate action needed",
      };
    if (riskLevel === "high")
      return {
        color: "text-orange-600 dark:text-orange-400",
        bgClass: isDarkMode
          ? "bg-orange-500/10 border-orange-500/20"
          : "bg-orange-50 border-orange-100",
        label: "High Risk",
        message: "Intervention recommended",
      };
    if (riskLevel === "medium")
      return {
        color: "text-amber-600 dark:text-amber-400",
        bgClass: isDarkMode
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-amber-50 border-amber-100",
        label: "Medium Risk",
        message: "Monitor closely",
      };
    return {
      color: "text-green-600 dark:text-green-400",
      bgClass: isDarkMode
        ? "bg-green-500/10 border-green-500/20"
        : "bg-green-50 border-green-100",
      label: "On Track",
      message: "Keep going strong",
    };
  };

  const details = getRiskDetails();

  return (
    <div className={`p-5 rounded-xl border ${details.bgClass}`}>
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`font-bold text-sm ${details.color} flex items-center gap-1.5 uppercase tracking-wider`}
        >
          <AlertTriangle size={16} /> Risk Analysis
        </h3>
        <span className={`text-2xl font-black ${details.color}`}>
          {riskScore}
        </span>
      </div>
      <div>
        <p
          className={`font-semibold mb-0.5 ${isDarkMode ? "text-zinc-200" : "text-gray-900"}`}
        >
          {details.label}
        </p>
        <p
          className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-gray-600"}`}
        >
          {details.message}
        </p>
      </div>
    </div>
  );
};

export const PerformancePrediction = ({ predictedPassRate, confidence }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div
      className={`p-5 rounded-xl border ${isDarkMode ? "bg-blue-900/10 border-blue-900/30" : "bg-blue-50 border-blue-100"}`}
    >
      <h3
        className={`font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
      >
        <Target size={16} /> Predicted Pass
      </h3>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-4xl font-black text-blue-500 mb-1">
            {predictedPassRate}%
          </div>
          <p
            className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${isDarkMode ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700"}`}
          >
            {confidence} Confidence
          </p>
        </div>
        <div
          className={`p-3 rounded-xl ${isDarkMode ? "bg-blue-900/20 text-blue-400" : "bg-white text-blue-500 shadow-sm"}`}
        >
          <TrendingUp size={24} />
        </div>
      </div>
    </div>
  );
};

export const StudentComparisonChart = ({ students }) => {
  const { isDarkMode } = useDarkMode();

  const data = students.map((s) => ({
    name: s.name.split(" ")[0],
    score: s.average_score,
    attempts: s.total_attempts,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDarkMode ? "#374151" : "#e5e7eb"}
        />
        <XAxis
          dataKey="name"
          stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
          style={{ fontSize: "12px" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
            border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Bar dataKey="score" fill="#3b82f6" />
        <Bar dataKey="attempts" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PerformanceDistribution = ({
  passCount,
  failCount,
  totalTests,
}) => {
  const { isDarkMode } = useDarkMode();

  const data = [
    { name: "Passed", value: passCount, fill: "#10b981" },
    { name: "Failed", value: failCount, fill: "#ef4444" },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
            border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
            borderRadius: "8px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
