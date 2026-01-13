import React, { useState } from 'react';
import { useDarkMode } from '../../contexts/DarkModeContext';
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
  AlertCircle
} from 'lucide-react';

// --- Utility Components ---

// 1. Reusable Card Wrapper for consistent UI
const DashboardCard = ({ title, icon: Icon, children, action, className = "" }) => {
  const { isDarkMode } = useDarkMode();
  return (
    <div className={`rounded-xl border transition-all duration-200 h-full ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700 shadow-lg shadow-black/20' 
        : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
    } ${className}`}>
      <div className={`p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />}
          <h2 className={`font-bold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

// 2. Empty State Component
const EmptyState = ({ message, subMessage, icon: Icon = BookOpen }) => {
  const { isDarkMode } = useDarkMode();
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center h-full min-h-[200px]">
      <div className={`p-3 rounded-full mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <Icon className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
      <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{message}</p>
      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{subMessage}</p>
    </div>
  );
};

// --- Main Components ---

export const RecentTestHistory = ({ attempts = [] }) => {
  const { isDarkMode } = useDarkMode();

  const getScoreColor = (score) => {
    if (score >= 80) return isDarkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200';
    if (score >= 60) return isDarkMode ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (score >= 40) return isDarkMode ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-orange-50 text-orange-700 border-orange-200';
    return isDarkMode ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
    });
  };

  if (!attempts || attempts.length === 0) {
    return (
      <DashboardCard title="Recent History" icon={Clock}>
        <EmptyState message="No tests taken yet" subMessage="Complete a test to see your history here." />
      </DashboardCard>
    );
  }

  return (
    <DashboardCard 
      title="Recent History" 
      icon={Clock}
      action={
        <button className={`text-xs font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          View All <ChevronRight className="w-3 h-3" />
        </button>
      }
    >
      <div className="space-y-3">
        {attempts.slice(0, 5).map((attempt, idx) => (
          <div 
            key={idx}
            className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
              isDarkMode 
                ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-750' 
                : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex-1 min-w-0 mr-4">
              <h4 className={`font-semibold truncate text-sm mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {attempt.tc_question_sets?.title || 'Untitled Test'}
              </h4>
              <div className="flex items-center gap-3 text-xs">
                <span className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Calendar className="w-3 h-3" />
                  {formatDate(attempt.created_at || attempt.completed_at)}
                </span>
                <span className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Clock className="w-3 h-3" />
                  {Math.floor(attempt.time_taken / 60)}m {attempt.time_taken % 60}s
                </span>
              </div>
            </div>
            
            <div className="text-right">
                <div className={`px-2.5 py-0.5 rounded-full border text-xs font-bold inline-block ${getScoreColor(attempt.score)}`}>
                {attempt.score}%
                </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};

export const StrengthsWeaknesses = ({ subjects = [] }) => {
  const { isDarkMode } = useDarkMode();

  const sortedByScore = [...subjects].sort((a, b) => (b.avgScore || b.mastery) - (a.avgScore || a.mastery));
  const strengths = sortedByScore.slice(0, 3);
  const weaknesses = sortedByScore.slice(-3).reverse();

  const ProgressBar = ({ value, colorClass, bgClass }) => (
    <div className={`h-2 w-full rounded-full mt-2 overflow-hidden ${bgClass}`}>
      <div 
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`} 
        style={{ width: `${value}%` }}
      />
    </div>
  );

  const SubjectRow = ({ subject, type }) => {
    const score = subject.avgScore || subject.mastery;
    const isStrength = type === 'strength';
    
    return (
      <div className="mb-5 last:mb-0 group">
        <div className="flex justify-between items-end mb-1">
          <span className={`font-medium text-sm truncate pr-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {subject.subject}
          </span>
          <span className={`font-bold text-sm ${isStrength ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
            {score}%
          </span>
        </div>
        <ProgressBar 
          value={score} 
          colorClass={isStrength ? 'bg-green-500' : 'bg-red-500'}
          bgClass={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} 
        />
        <div className="flex justify-between mt-1 items-center h-4">
          <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {subject.attempts} tests taken
          </span>
          {!isStrength && (
             <button className={`text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
               Practice Now →
             </button>
          )}
        </div>
      </div>
    );
  };

  if (!subjects || subjects.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="Top Strengths" icon={TrendingUp}>
          <EmptyState message="No data yet" subMessage="Take more tests to analyze strengths." icon={Target} />
        </DashboardCard>
        <DashboardCard title="Focus Areas" icon={TrendingDown}>
          <EmptyState message="No data yet" subMessage="Weaknesses will appear here." icon={AlertCircle} />
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DashboardCard title="Top Strengths" icon={TrendingUp}>
        <div className="pt-2">
          {strengths.map((sub, idx) => <SubjectRow key={idx} subject={sub} type="strength" />)}
        </div>
      </DashboardCard>

      <DashboardCard title="Focus Areas" icon={TrendingDown}>
        <div className="pt-2">
          {weaknesses.map((sub, idx) => <SubjectRow key={idx} subject={sub} type="weakness" />)}
        </div>
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
    // Generate exactly 12 weeks of data (84 days) for a clean grid
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        dateStr: date.toISOString().split('T')[0],
        dateObj: date,
        count: 0
      });
    }

    attempts?.forEach(attempt => {
      const attemptDate = new Date(attempt.created_at || attempt.completed_at).toISOString().split('T')[0];
      const day = days.find(d => d.dateStr === attemptDate);
      if (day) day.count++;
    });

    return days;
  };

  const calendar = generateCalendar();
  const maxCount = Math.max(...calendar.map(d => d.count), 1);

  const getIntensityColor = (count) => {
    if (count === 0) return isDarkMode ? 'bg-gray-800' : 'bg-gray-100';
    
    // Calculate intensity 1-4
    const intensity = Math.ceil((count / maxCount) * 4);
    
    // Using green scale
    const darkColors = ['bg-green-900/60', 'bg-green-800', 'bg-green-600', 'bg-green-500'];
    const lightColors = ['bg-green-200', 'bg-green-300', 'bg-green-500', 'bg-green-600'];
    
    return isDarkMode 
      ? darkColors[intensity - 1] || darkColors[0]
      : lightColors[intensity - 1] || lightColors[0];
  };

  return (
    <DashboardCard title="Study Consistency" icon={Activity}>
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
           {/* Grid: 7 rows (Days), 12 columns (Weeks) */}
           <div className="grid grid-rows-7 grid-flow-col gap-1">
             {/* Labels (Left column) */}
             <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center"></div> 
             <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center">M</div>
             <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center"></div>
             <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center">W</div>
             <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center"></div>
             <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center">F</div>
             <div className="text-[9px] text-gray-400 h-3 w-4 flex items-center"></div>

             {/* Heatmap Squares */}
             {calendar.map((day, idx) => (
               <div
                 key={idx}
                 onMouseEnter={() => setHoveredDay(day)}
                 onMouseLeave={() => setHoveredDay(null)}
                 className={`w-3 h-3 rounded-[2px] ${getIntensityColor(day.count)} cursor-pointer transition-all hover:scale-125 hover:z-10`}
               />
             ))}
           </div>
        </div>

        {/* Footer: Dynamic Tooltip & Legend */}
        <div className="h-6 mt-4 flex items-center justify-between border-t border-dashed border-gray-200 dark:border-gray-700 pt-2">
           <div className={`text-xs font-medium transition-opacity duration-200 ${hoveredDay ? 'opacity-100' : 'opacity-0'} ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
             {hoveredDay ? (
                <span className="flex items-center gap-2">
                    <span className="font-bold">{hoveredDay.count} test{hoveredDay.count !== 1 ? 's' : ''}</span> 
                    on {hoveredDay.dateObj.toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric'})}
                </span>
             ) : '...'}
           </div>

           <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-500">Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div 
                  key={level} 
                  className={`w-2.5 h-2.5 rounded-[2px] ${getIntensityColor(level === 0 ? 0 : (maxCount/4)*level)}`} 
                />
              ))}
              <span className="text-[10px] text-gray-500">More</span>
           </div>
        </div>
      </div>
    </DashboardCard>
  );
};