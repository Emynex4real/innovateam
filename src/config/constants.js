export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  WALLET: '/wallet',
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

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  THEME: 'theme',
};

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again later.',
  AUTH_REQUIRED: 'You must be logged in to access this resource.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Registration successful!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  PROFILE_UPDATE: 'Profile updated successfully!',
  PASSWORD_RESET: 'Password reset successful!',
}; 