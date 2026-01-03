import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useDarkMode } from '../../contexts/DarkModeContext';

const SkillRadarChart = ({ skills }) => {
  const { isDarkMode } = useDarkMode();

  if (!skills || skills.length === 0) return null;

  const data = skills.map(s => ({
    subject: s.subject || s.name,
    score: Math.round(s.score || s.percentage || 0),
    fullMark: 100
  }));

  return (
    <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white shadow-lg'}`}>
      <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        📊 Skill Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]}
            tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280' }}
          />
          <Radar 
            name="Performance" 
            dataKey="score" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.6} 
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              color: isDarkMode ? '#ffffff' : '#000000'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
        {data.map((item, idx) => (
          <div key={idx} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.subject}</p>
            <p className={`text-lg font-bold ${item.score >= 70 ? 'text-green-600' : item.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {item.score}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillRadarChart;
