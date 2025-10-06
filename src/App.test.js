import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import * as authService from './services/auth.service';

// Mock the auth service
jest.mock('./services/auth.service', () => ({
  getCurrentUser: jest.fn(),
  logout: jest.fn(),
}));

// Mock the Loading component
jest.mock('./components/Loading', () => {
  return function MockLoading() {
    return <div data-testid="loading">Loading...</div>;
  };
});

// Mock the layouts
jest.mock('./layouts/PublicLayout', () => {
  return function MockPublicLayout({ children }) {
    return <div data-testid="public-layout">{children}</div>;
  };
});

jest.mock('./layouts/AuthenticatedLayout', () => {
  return function MockAuthenticatedLayout({ children }) {
    return <div data-testid="authenticated-layout">{children}</div>;
  };
});

// Mock the routes
jest.mock('./routes', () => ({
  publicRoutes: [
    {
      path: '/login',
      element: <div data-testid="login-page">Login Page</div>,
      title: 'Login',
    },
  ],
  privateRoutes: [
    {
      path: '/dashboard',
      element: <div data-testid="dashboard-page">Dashboard Page</div>,
      title: 'Dashboard',
    },
  ],
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const renderWithProviders = (component) => {
  return render(
    <AuthProvider>
      <DarkModeProvider>
        <BrowserRouter>{component}</BrowserRouter>
      </DarkModeProvider>
    </AuthProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the URL before each test
    window.history.pushState({}, '', '/');
  });

  it('renders without crashing', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    authService.getCurrentUser.mockResolvedValue(null);
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/login');
    });
  });

  it('redirects to dashboard when authenticated', async () => {
    authService.getCurrentUser.mockResolvedValue({ id: 1, email: 'test@example.com' });
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });

  it('handles authentication errors gracefully', async () => {
    authService.getCurrentUser.mockRejectedValue(new Error('Auth error'));
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });
});
