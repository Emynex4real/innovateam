import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const colorClasses = {
  primary: 'text-primary-500',
  secondary: 'text-secondary-500',
  success: 'text-success-500',
  danger: 'text-danger-500',
  warning: 'text-warning-500',
  info: 'text-info-500',
};

const spinnerVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const Loading = ({ size = 'md', color = 'primary', text = 'Loading...', variant = 'spinner', className }) => {
  const containerClasses = cn('flex flex-col items-center justify-center w-full h-full', className);
  const spinnerClasses = cn('animate-spin', sizeClasses[size], colorClasses[color]);

  return (
    <div
      data-testid="loading"
      className={containerClasses}
      role="status"
      aria-label="Loading"
    >
      {variant === 'spinner' ? (
        <motion.div
          data-testid="loading-spinner"
          className={spinnerClasses}
          variants={spinnerVariants}
          animate="spin"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="w-full h-full"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </motion.div>
      ) : (
        <div className="flex space-x-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${colorClasses[color]}`}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className={`w-2 h-2 rounded-full ${colorClasses[color]}`}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
          <motion.div
            className={`w-2 h-2 rounded-full ${colorClasses[color]}`}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.4,
            }}
          />
        </div>
      )}
      <span className="mt-2 text-sm text-gray-500">{text}</span>
    </div>
  );
};

Loading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info']),
  text: PropTypes.string,
  variant: PropTypes.oneOf(['spinner', 'dots']),
  className: PropTypes.string,
};

export default Loading;
