import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  small: 'h-4 w-4',
  medium: 'h-8 w-8',
  large: 'h-12 w-12',
};

const colors = {
  primary: 'text-primary-600',
  white: 'text-white',
  gray: 'text-gray-600',
};

const Loading = ({
  variant = 'medium',
  color = 'primary',
  fullScreen = false,
  text = 'Loading...',
  className = '',
}) => {
  const baseClasses = 'animate-spin';
  const sizeClass = variants[variant] || variants.medium;
  const colorClass = colors[color] || colors.primary;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className={`${baseClasses} ${sizeClass} ${colorClass} ${className}`} />
          {text && (
            <p className="text-gray-600 font-medium text-sm">{text}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`${baseClasses} ${sizeClass} ${colorClass} ${className}`} />
        {text && (
          <p className="text-gray-600 font-medium text-sm">{text}</p>
        )}
      </div>
    </div>
  );
};

export default Loading; 