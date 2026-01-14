import React, { useState } from "react";
import { useDarkMode } from "../../contexts/DarkModeContext";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  ChevronRight,
  Activity,
  Target,
  BookOpen,
  Award,
  AlertCircle,
} from "lucide-react";

// --- Utility Components ---

// 1. Reusable Card Wrapper (Updated for better flex behavior)
const DashboardCard = ({
  title,
  icon: Icon,
  children,
  action,
  className = "",
}) => {
  const { isDarkMode } = useDarkMode();
  return (
    <div
      className={`rounded-xl border transition-all duration-200 flex flex-col ${
        isDarkMode
          ? "bg-gray-800 border-gray-700 shadow-lg shadow-black/20"
          : "bg-white border-gray-200 shadow-sm hover:shadow-md"
      } ${className}`}
    >
      <div
        className={`px-5 py-4 border-b flex-shrink-0 ${
          isDarkMode ? "border-gray-700" : "border-gray-100"
        } flex justify-between items-center`}
      >
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              className={`w-5 h-5 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            />
          )}
          <h2
            className={`font-bold text-lg ${
              isDarkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="p-5 flex-1">{children}</div>
    </div>
  );
};

// 2. Empty State Component
const EmptyState = ({ message, subMessage, icon: Icon = BookOpen }) => {
  const { isDarkMode } = useDarkMode();
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center h-full min-h-[150px]">
      <div
        className={`p-3 rounded-full mb-3 ${
          isDarkMode ? "bg-gray-700" : "bg-gray-100"
        }`}
      >
        <Icon
          className={`w-6 h-6 ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        />
      </div>
      <p
        className={`font-medium ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {message}
      </p>
      <p
        className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
      >
        {subMessage}
      </p>
    </div>
  );
};

// --- Functional Components ---

export const RecentTestHistory = ({ attempts = [] }) => {
  const { isDarkMode } = useDarkMode();

  const getScoreColor = (score) => {
    if (score >= 80)
      return isDarkMode
        ? "bg-green-500/20 text-green-400 border-green-500/30"
        : "bg-green-50 text-green-700 border-green-200";
    if (score >= 60)
      return isDarkMode
        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
        : "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (score >= 40)
      return isDarkMode
        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
        : "bg-orange-50 text-orange-700 border-orange-200";
    return isDarkMode
      ? "bg-red-500/20 text-red-400 border-red-500/30"
      : "bg-red-50 text-red-700 border-red-200";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardCard
      title="Recent History"
      icon={Clock}
      className="" // Ensures card fills grid cell
      action={
        attempts.length > 0 && (
          <button
            className={`group text-xs font-semibold flex items-center gap-1 transition-all px-3 py-1.5 rounded-full border ${
              isDarkMode
                ? "text-blue-400 border-blue-400/20 hover:bg-blue-400/10"
                : "text-blue-600 border-blue-600/10 hover:bg-blue-50"
            }`}
          >
            View All
            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        )
      }
    >
      <div className="flex flex-col h-full">
        {attempts && attempts.length > 0 ? (
          <div
            className={`divide-y ${
              isDarkMode ? "divide-gray-800" : "divide-gray-100"
            }`}
          >
            {attempts.slice(0, 5).map((attempt, idx) => (
              <div
                key={idx}
                className={`group flex items-center justify-between py-4 first:pt-0 last:pb-0 transition-all duration-200 cursor-pointer`}
              >
                {/* Left Section: Info */}
                <div className="flex-1 min-w-0 mr-4">
                  <h4
                    className={`font-bold truncate text-sm mb-1.5 transition-colors ${
                      isDarkMode
                        ? "text-gray-100 group-hover:text-blue-400"
                        : "text-gray-900 group-hover:text-blue-600"
                    }`}
                  >
                    {attempt.tc_question_sets?.title || "Untitled Test"}
                  </h4>

                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center gap-1.5 text-xs font-medium ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(attempt.created_at || attempt.completed_at)}
                    </div>

                    <div
                      className={`flex items-center gap-1.5 text-xs font-medium ${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {Math.floor(attempt.time_taken / 60)}m{" "}
                      {attempt.time_taken % 60}s
                    </div>
                  </div>
                </div>

                {/* Right Section: Score & Arrow */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={`min-w-[54px] text-center px-2.5 py-1 rounded-md border text-[11px] font-black tracking-tighter uppercase shadow-sm ${getScoreColor(
                        attempt.score
                      )}`}
                    >
                      {attempt.score}%
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-all opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${
                      isDarkMode ? "text-gray-600" : "text-gray-300"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No tests taken yet"
            subMessage="Complete a test to see your history here."
          />
        )}
      </div>
    </DashboardCard>
  );
};

export const StrengthsWeaknesses = ({ subjects = [] }) => {
  const { isDarkMode } = useDarkMode();

  const sortedByScore = [...subjects].sort(
    (a, b) => (b.avgScore || b.mastery) - (a.avgScore || a.mastery)
  );
  const strengths = sortedByScore.slice(0, 3);
  const weaknesses = sortedByScore.slice(-3).reverse();

  const ProgressBar = ({ value, colorClass, bgClass }) => (
    <div className={`h-1.5 w-full rounded-full mt-1.5 overflow-hidden ${bgClass}`}>
      <div
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );

  const SubjectRow = ({ subject, type }) => {
    const score = subject.avgScore || subject.mastery;
    const isStrength = type === "strength";

    return (
      <div className="mb-2.5 last:mb-0 group">
        <div className="flex justify-between items-end mb-1">
          <span
            className={`font-medium text-sm truncate pr-2 ${
              isDarkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {subject.subject}
          </span>
          <span
            className={`font-bold text-xs ${
              isStrength
                ? isDarkMode
                  ? "text-green-400"
                  : "text-green-600"
                : isDarkMode
                ? "text-red-400"
                : "text-red-600"
            }`}
          >
            {score}%
          </span>
        </div>
        <ProgressBar
          value={score}
          colorClass={isStrength ? "bg-green-500" : "bg-red-500"}
          bgClass={isDarkMode ? "bg-gray-700" : "bg-gray-100"}
        />
      </div>
    );
  };

  // Modified layout: Stack vertically instead of force grid
  // This allows the parent component to control the grid layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <DashboardCard title="Top Strengths" icon={TrendingUp} className="flex-1">
        {subjects.length > 0 ? (
          <div className="pt-1">
            {strengths.map((sub, idx) => (
              <SubjectRow key={idx} subject={sub} type="strength" />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No data yet"
            subMessage="Take tests to analyze strengths."
            icon={Target}
          />
        )}
      </DashboardCard>

      <DashboardCard title="Focus Areas" icon={TrendingDown} className="flex-1">
        {subjects.length > 0 ? (
          <div className="pt-1">
            {weaknesses.map((sub, idx) => (
              <SubjectRow key={idx} subject={sub} type="weakness" />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No data yet"
            subMessage="Weaknesses will appear here."
            icon={AlertCircle}
          />
        )}
      </DashboardCard>
    </div>
  );
};

export const StudyCalendarHeatmap = ({ attempts = [] }) => {
  const { isDarkMode } = useDarkMode();
  const [hoveredDay, setHoveredDay] = useState(null);

  const generateCalendar = () => {
    const days = [];
    const today = new Date();
    // 12 weeks looks best on most screens
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        dateStr: date.toISOString().split("T")[0],
        dateObj: date,
        count: 0,
      });
    }

    attempts?.forEach((attempt) => {
      const attemptDate = new Date(attempt.created_at || attempt.completed_at)
        .toISOString()
        .split("T")[0];
      const day = days.find((d) => d.dateStr === attemptDate);
      if (day) day.count++;
    });

    return days;
  };

  const calendar = generateCalendar();
  const maxCount = Math.max(...calendar.map((d) => d.count), 1);

  const getIntensityColor = (count) => {
    if (count === 0) return isDarkMode ? "bg-gray-800" : "bg-gray-100";
    const intensity = Math.ceil((count / maxCount) * 4);
    const darkColors = [
      "bg-green-900/60",
      "bg-green-800",
      "bg-green-600",
      "bg-green-500",
    ];
    const lightColors = [
      "bg-green-200",
      "bg-green-300",
      "bg-green-500",
      "bg-green-600",
    ];
    return isDarkMode
      ? darkColors[intensity - 1] || darkColors[0]
      : lightColors[intensity - 1] || lightColors[0];
  };

  return (
    <DashboardCard title="Study Consistency" icon={Activity}>
      <div className="flex flex-col h-full justify-between">
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-1 min-w-max mx-auto md:mx-0">
            {/* Grid: 7 rows (Days), 12 columns (Weeks) */}
            <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
              {/* Day Labels */}
              <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center"></div>
              <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center">
                M
              </div>
              <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center"></div>
              <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center">
                W
              </div>
              <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center"></div>
              <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center">
                F
              </div>
              <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center"></div>

              {/* Heatmap Squares */}
              {calendar.map((day, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3 h-3 rounded-[2px] ${getIntensityColor(
                    day.count
                  )} cursor-pointer transition-all hover:scale-125 hover:z-10`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between border-t border-dashed border-gray-200 dark:border-gray-700 pt-3 mt-2">
          <div
            className={`text-xs font-medium transition-opacity ${
              hoveredDay ? "opacity-100" : "opacity-0"
            } ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            {hoveredDay ? (
              <span>
                <b>{hoveredDay.count}</b> on{" "}
                {hoveredDay.dateObj.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            ) : (
              "..."
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-gray-400">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-[1px] ${getIntensityColor(
                  level === 0 ? 0 : (maxCount / 4) * level
                )}`}
              />
            ))}
            <span className="text-[9px] text-gray-400">More</span>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

// --- MAIN LAYOUT COMPONENT ---

export const StudentDashboard = ({
  recentAttempts = [],
  subjectPerformance = [],
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Main Grid Layout 
          - On Mobile: Single Column
          - On Desktop: 12-column grid
            - Left (8 cols): Consistency + History
            - Right (4 cols): Strengths + Weaknesses
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Consistency: Full width of Main Column */}
          <div className="w-full">
            <StudyCalendarHeatmap attempts={recentAttempts} />
          </div>

          {/* History: Below Consistency */}
          <div className="w-full">
            <RecentTestHistory attempts={recentAttempts} />
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 h-full">
            <StrengthsWeaknesses subjects={subjectPerformance} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;