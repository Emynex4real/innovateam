// Enterprise Design System - Industry Standard

export const designSystem = {
  colors: {
    primary: {
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

export const componentStyles = {
  button: {
    primary: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-all duration-200',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all duration-200',
  },

  card: {
    default: 'bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-200 hover:shadow-xl',
    interactive: 'bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.01] cursor-pointer',
  },

  input: {
    default: 'w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400',
  },

  badge: {
    success: 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold',
    warning: 'px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold',
    error: 'px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold',
  },
};

export const layouts = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 md:py-16 lg:py-20',
};

export default designSystem;
