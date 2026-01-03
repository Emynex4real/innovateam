import React from 'react';

const StatsCard = ({ bgColor, label, value, subtitle, stars }) => {
  return (
    <div className={`${bgColor} p-4 rounded-xl`}>
      {stars && (
        <div className="mb-1 text-xs">
          {"★★★★★"} <span className="ml-1">5.0</span>
        </div>
      )}
      <div className="text-sm">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && <div className="text-sm">{subtitle}</div>}
    </div>
  );
};

export default StatsCard;