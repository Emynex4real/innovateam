import React from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDarkMode } from '../../contexts/DarkModeContext';

export const ScoreTrendChart = ({ data, days = 30 }) => {
  const { isDarkMode } = useDarkMode();

  if (!data || data.length === 0) {
    return (
      <div className={`h-64 flex items-center justify-center rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="date" 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
          domain={[0, 100]}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px'
          }}
          labelStyle={{ color: isDarkMode ? '#e5e7eb' : '#1f2937' }}
        />
        <Area 
          type="monotone" 
          dataKey="score" 
          stroke="#3b82f6" 
          fillOpacity={1} 
          fill="url(#colorScore)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const TopicMasteryHeatmap = ({ data }) => {
  const { isDarkMode } = useDarkMode();

  const getColor = (mastery) => {
    if (mastery >= 80) return 'bg-green-500';
    if (mastery >= 60) return 'bg-yellow-500';
    if (mastery >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTextColor = (mastery) => {
    if (mastery >= 80) return 'text-green-600 dark:text-green-400';
    if (mastery >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (mastery >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-3">
      {data.map((topic, idx) => (
        <div key={idx} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {topic.subject}
            </h4>
            <span className={`text-sm font-bold ${getTextColor(topic.mastery_level)}`}>
              {topic.mastery_level}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
            <div 
              className={`h-full ${getColor(topic.mastery_level)} transition-all duration-500`}
              style={{ width: `${topic.mastery_level}%` }}
            />
          </div>
          <div className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {topic.questions_correct}/{topic.questions_answered} correct • {topic.accuracy}% accuracy
          </div>
        </div>
      ))}
    </div>
  );
};

export const AtRiskIndicator = ({ riskScore, riskLevel }) => {
  const { isDarkMode } = useDarkMode();

  const getRiskColor = () => {
    if (riskLevel === 'critical') return 'from-red-600 to-red-800';
    if (riskLevel === 'high') return 'from-orange-600 to-orange-800';
    if (riskLevel === 'medium') return 'from-yellow-600 to-yellow-800';
    return 'from-green-600 to-green-800';
  };

  const getRiskLabel = () => {
    if (riskLevel === 'critical') return '⚠️ CRITICAL - Immediate Action Needed';
    if (riskLevel === 'high') return '⚠️ HIGH RISK - Intervention Recommended';
    if (riskLevel === 'medium') return '⚠️ MEDIUM RISK - Monitor Closely';
    return '✅ LOW RISK - On Track';
  };

  return (
    <div className={`bg-gradient-to-r ${getRiskColor()} text-white rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">At-Risk Score</h3>
        <div className="text-4xl font-bold">{riskScore}/100</div>
      </div>
      <p className="text-sm font-semibold mb-3">{getRiskLabel()}</p>
      <div className={`w-full h-3 rounded-full ${isDarkMode ? 'bg-white/20' : 'bg-red-900/30'} overflow-hidden`}>
        <div 
          className="h-full bg-white"
          style={{ width: `${riskScore}%` }}
        />
      </div>
    </div>
  );
};

export const PerformancePrediction = ({ predictedPassRate, confidence }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
      <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Predicted Pass Rate
      </h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl font-bold text-blue-600 mb-2">{predictedPassRate}%</div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Confidence: {confidence}
          </p>
        </div>
        <div className="text-5xl">
          {predictedPassRate >= 70 ? '📈' : predictedPassRate >= 50 ? '📊' : '📉'}
        </div>
      </div>
    </div>
  );
};

export const StudentComparisonChart = ({ students }) => {
  const { isDarkMode } = useDarkMode();

  const data = students.map(s => ({
    name: s.name.split(' ')[0],
    score: s.average_score,
    attempts: s.total_attempts
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="name" 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke={isDarkMode ? '#9ca3af' : '#6b7280'}
          style={{ fontSize: '12px' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="score" fill="#3b82f6" />
        <Bar dataKey="attempts" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const PerformanceDistribution = ({ passCount, failCount, totalTests }) => {
  const { isDarkMode } = useDarkMode();

  const data = [
    { name: 'Passed', value: passCount, fill: '#10b981' },
    { name: 'Failed', value: failCount, fill: '#ef4444' }
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
