// Design System - Industry Standard with Brand Colors

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7', // Main purple
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  // Status Colors
  success: {
    light: '#10b981',
    main: '#059669',
    dark: '#047857',
  },
  warning: {
    light: '#f59e0b',
    main: '#d97706',
    dark: '#b45309',
  },
  error: {
    light: '#ef4444',
    main: '#dc2626',
    dark: '#b91c1c',
  },
  // Neutrals
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  }
};

export const gradients = {
  primary: 'bg-gradient-to-r from-green-600 to-emerald-600',
  primaryHover: 'hover:from-green-700 hover:to-emerald-700',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600',
  warning: 'bg-gradient-to-r from-yellow-500 to-orange-600',
  error: 'bg-gradient-to-r from-red-500 to-pink-600',
  subtle: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
  dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
};

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg shadow-blue-500/10',
  xl: 'shadow-xl shadow-blue-500/20',
  '2xl': 'shadow-2xl shadow-blue-500/30',
  glow: 'shadow-lg shadow-blue-500/50',
  glowPurple: 'shadow-lg shadow-purple-500/50',
};

export const animations = {
  fadeIn: 'animate-in fade-in duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  pulse: 'animate-pulse',
};

export const spacing = {
  section: 'py-8 md:py-12',
  card: 'p-6 md:p-8',
  cardSm: 'p-4 md:p-6',
};

export const typography = {
  h1: 'text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
  h2: 'text-2xl md:text-3xl font-bold tracking-tight',
  h3: 'text-xl md:text-2xl font-bold',
  h4: 'text-lg md:text-xl font-semibold',
  body: 'text-base',
  small: 'text-sm',
  xs: 'text-xs',
};

export const buttons = {
  primary: `${gradients.primary} ${gradients.primaryHover} text-white font-bold rounded-xl transition-all ${shadows.lg} hover:${shadows.xl}`,
  secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all',
  success: `${gradients.success} hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all ${shadows.lg}`,
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all',
};

export const cards = {
  default: 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all',
  elevated: `bg-white dark:bg-gray-900 rounded-2xl ${shadows.lg} hover:${shadows.xl} transition-all`,
  gradient: `${gradients.primary} rounded-2xl text-white ${shadows.xl}`,
  glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50',
};

export const badges = {
  primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold',
};

export const inputs = {
  default: 'w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all',
};

export const componentStyles = {
  button: {
    primary: `${gradients.primary} ${gradients.primaryHover} text-white font-bold rounded-xl transition-all ${shadows.lg} hover:${shadows.xl} px-6 py-3`,
    secondary: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all px-6 py-3',
    success: `${gradients.success} hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all ${shadows.lg} px-6 py-3`,
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all px-6 py-3',
  },
  card: {
    default: 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all p-6',
    elevated: `bg-white dark:bg-gray-900 rounded-2xl ${shadows.lg} hover:${shadows.xl} transition-all p-6`,
    gradient: `${gradients.primary} rounded-2xl text-white ${shadows.xl} p-6`,
    glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 p-6',
    interactive: 'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] p-6',
  },
  badge: {
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold',
  },
  input: {
    default: 'w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all',
  },
};
