const mockAuthService = {
  login: jest.fn(() => Promise.resolve({ token: 'test-token' })),
  logout: jest.fn(),
  register: jest.fn(() => Promise.resolve({ token: 'test-token' })),
  refreshToken: jest.fn(() => Promise.resolve({ token: 'new-test-token' })),
  getToken: jest.fn(() => 'test-token'),
  setToken: jest.fn(),
  removeToken: jest.fn(),
  isAuthenticated: jest.fn(() => true),
};

export default mockAuthService; 