import React from 'react';

const Logo = ({ className = '', size = 'md', textColor = 'gradient' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const textColorClasses = {
    gradient: 'bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent',
    inherit: 'text-current',
    white: 'text-white',
    dark: 'text-gray-900',
    green: 'text-green-600'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">I</span>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-full"></div>
      </div>
      <span className={`font-bold ${textColorClasses[textColor]} ${sizeClasses[size]}`}>
        InnovaTeam
      </span>
    </div>
  );
};

export default Logo;