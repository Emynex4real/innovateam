import { LOCAL_STORAGE_KEYS } from '../config/constants';
import logger from '../utils/logger';
import { 
  sanitizeInput, 
  isValidEmail, 
  isValidPassword, 
  validateLoginData, 
  validateRegistrationData,
  sanitizeUserData 
} from '../utils/validation';




// Mock user database for local-only authentication
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'Admin123!',
    name: 'Admin User',
    role: 'admin',
    isAdmin: true,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'User123!',
    name: 'Regular User',
    role: 'user',
    isAdmin: false,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];



class AuthService {
  async login(credentials) {
    logger.auth('Login attempt started');
    const validation = validateLoginData(credentials);
    if (!validation.isValid) {
      return { success: false, error: Object.values(validation.errors)[0] };
    }
    const email = credentials.email.toLowerCase().trim();
    const password = credentials.password;
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      logger.auth('Invalid credentials');
      return { success: false, error: 'Invalid credentials' };
    }
    this.setUser(user);
    this.setToken('mock-token');
    this.setRefreshToken('mock-refresh-token');
    logger.auth('Login successful');
    return { success: true, user };
  }

  async register(userData) {
    logger.auth('Registration attempt started');
    const validation = validateRegistrationData(userData);
    if (!validation.isValid) {
      return { success: false, error: Object.values(validation.errors)[0] };
    }
    const email = userData.email.toLowerCase().trim();
    if (mockUsers.find(u => u.email === email)) {
      logger.auth('Email already registered');
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      id: String(mockUsers.length + 1),
      email,
      password: userData.password,
      name: userData.name,
      role: 'user',
      isAdmin: false,
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    this.setUser(newUser);
    this.setToken('mock-token');
    this.setRefreshToken('mock-refresh-token');
    logger.auth('Registration successful');
    return { success: true, user: newUser };
  }

  async logout() {
    logger.auth('Logout attempt started');
    this.clearStorage();
    logger.auth('Logout successful');
    return { success: true };
  }

  async validateToken() {
    // Always valid for local-only
    return !!this.getUser();
  }

  // Secure storage methods with error handling
  setUser(user) {
    if (!user) return false;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      return true;
    } catch (error) {
      logger.auth('Failed to store user', { error: error.message });
      return false;
    }
  }

  setToken(token) {
    if (!token) return false;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      return true;
    } catch (error) {
      logger.auth('Failed to store token', { error: error.message });
      return false;
    }
  }

  setRefreshToken(token) {
    if (!token) return false;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
      return true;
    } catch (error) {
      logger.auth('Failed to store refresh token', { error: error.message });
      return false;
    }
  }

  getToken() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      logger.auth('Failed to get token', { error: error.message });
      return null;
    }
  }

  getRefreshToken() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      logger.auth('Failed to get refresh token', { error: error.message });
      return null;
    }
  }

  getUser() {
    try {
      const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      logger.auth('Failed to get user', { error: error.message });
      return null;
    }
  }

  clearStorage() {
    logger.auth('Clearing auth storage');
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REMEMBER_ME);
    } catch (error) {
      logger.auth('Failed to clear storage', { error: error.message });
    }
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  setRememberMe(value) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REMEMBER_ME, value.toString());
    } catch (error) {
      logger.auth('Failed to set remember me', { error: error.message });
    }
  }

  getRememberMe() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBER_ME) === 'true';
    } catch (error) {
      logger.auth('Failed to get remember me', { error: error.message });
      return false;
    }
  }
}

const authService = new AuthService();
export default authService;