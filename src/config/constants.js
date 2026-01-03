export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://innovateam-api.onrender.com/api'
  : 'http://localhost:5000/api';

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  WALLET: '/wallet',
};

// Storage keys for authentication and user data
export const LOCAL_STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: process.env.REACT_APP_TOKEN_KEY || 'jamb_auth_token',
  REFRESH_TOKEN: process.env.REACT_APP_REFRESH_KEY || 'jamb_refresh_token',
  USER: process.env.REACT_APP_USER_KEY || 'jamb_user_data',
  REMEMBER_ME: 'jamb_remember_me',
  
  // App settings
  THEME: 'theme',
  LANGUAGE: 'language',
  
  // For debugging
  LAST_AUTH_ACTION: 'last_auth_action',
  LAST_ERROR: 'last_auth_error'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    VALIDATE_TOKEN: '/auth/validate',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile/update',
    CHANGE_PASSWORD: '/user/password/change',
  },
  SERVICES: {
    WAEC: '/services/waec',
    NECO: '/services/neco',
    NABTEB: '/services/nabteb',
    JAMB: '/services/jamb',
  },
};

export const TOAST_CONFIG = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const RESULT_CHECKER_SERVICES = {
  WAEC: 'waec',
  NECO: 'neco',
  NBAIS: 'nbais',
  NABTEB: 'nabteb',
  WAEC_GCE: 'waec-gce',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC: 'Something went wrong. Please try again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Registration successful!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  PROFILE_UPDATE: 'Profile updated successfully!',
  PASSWORD_RESET: 'Password reset successful!',
  EMAIL_VERIFICATION: 'Email verified successfully!',
};

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\+?[1-9]\d{1,14}$/,
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
}; 