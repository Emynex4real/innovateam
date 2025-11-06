const mockApiService = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  upload: jest.fn(() => Promise.resolve({ data: {} })),
  setAuthToken: jest.fn(),
  removeAuthToken: jest.fn(),
};

export default mockApiService; 