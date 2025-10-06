import React, { Suspense, useEffect, useMemo } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";
import SimpleAdminLayout from "./components/SimpleAdminLayout";

// Routes
import publicRoutes from "./routes/publicRoutes";
import privateRoutes from "./routes/privateRoutes";

// Components
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";

// Contexts
import { AuthProvider } from "./contexts/SupabaseAuthContext";
// import { WalletProvider } from "./contexts/WalletContext"; // Replaced by Supabase
import { DarkModeProvider } from "./contexts/DarkModeContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AdminProvider } from "./contexts/AdminContext";
import { SecurityProvider } from "./components/security/SecurityProvider";

// Pages
import AdminPanel from "./pages/admin";

// Utils
import logger from "./utils/logger";
import { TOAST_CONFIG } from "./config/constants";
import { SecurityUtils } from "./config/security";

// Security headers setup
const setupSecurityHeaders = () => {
  // CSP disabled to avoid connection issues

  // Add security event listeners
  window.addEventListener('securitypolicyviolation', (event) => {
    logger.security('CSP violation', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective
    });
  });

  // Prevent clickjacking
  if (window.self !== window.top) {
    logger.security('Clickjacking attempt detected');
    window.top.location = window.self.location;
  }
};

// Enhanced Error Boundary with security logging
class SecureErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error securely
    logger.error("Application error caught", {
      message: error.message,
      stack: error.stack?.slice(0, 500), // Limit stack trace length
      componentStack: errorInfo.componentStack?.slice(0, 500)
    });

    this.setState({ errorInfo });

    // Report to monitoring service if available
    if (window.reportError) {
      window.reportError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <h1 className="text-2xl font-bold text-white font-poppins">
              Something went wrong
            </h1>
            <p className="mt-2 text-gray-200">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-sm text-gray-300">
                <summary>Show error details</summary>
                <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-auto max-h-32">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <div className="mt-4 space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="py-2 px-4 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="py-2 px-4 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-all"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Secure loading component
const SecureLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500">
    <div className="text-center">
      <Loading />
      <p className="mt-4 text-white font-medium">Loading securely...</p>
    </div>
  </div>
);

function App() {
  const location = useLocation();

  const allRoutes = useMemo(() => [
    ...publicRoutes,
    ...privateRoutes.map((route) => ({
      ...route,
      path: `/dashboard${route.path === "/" ? "" : route.path}`,
    })),
  ], []);

  useEffect(() => {
    // Setup security measures (CSP disabled)
    // setupSecurityHeaders();

    // Set page title
    const currentRoute = allRoutes.find((route) => route.path === location.pathname);
    document.title = currentRoute?.title ? `${currentRoute.title} | InnovaTeam` : "InnovaTeam";

    // Log page navigation
    logger.userAction('Page navigation', {
      path: location.pathname,
      title: document.title
    });

    // Performance monitoring
    if (window.performance && window.performance.mark) {
      window.performance.mark('app-render-start');
    }

    return () => {
      if (window.performance && window.performance.mark) {
        window.performance.mark('app-render-end');
        window.performance.measure('app-render', 'app-render-start', 'app-render-end');
      }
    };
  }, [location, allRoutes]);

  return (
    <SecurityProvider>
      <AuthProvider>
        <ThemeProvider>
          <DarkModeProvider>
            <SecureErrorBoundary>
              <div className="App">
                <Suspense fallback={<SecureLoading />}>
                  <Routes>
                    {/* Public Routes */}
                    {publicRoutes.map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={
                          <ErrorBoundary>
                            <PublicLayout>{route.element}</PublicLayout>
                          </ErrorBoundary>
                        }
                      />
                    ))}

                    {/* Private Dashboard Routes */}
                    <Route
                      path="/dashboard/*"
                      element={
                        <PrivateRoute>
                          <ErrorBoundary>
                            <PrivateLayout>
                              <Routes>
                                {privateRoutes.map((route) => (
                                  <Route
                                    key={route.path}
                                    path={route.path}
                                    element={
                                      <ErrorBoundary>
                                        {route.element}
                                      </ErrorBoundary>
                                    }
                                  />
                                ))}
                              </Routes>
                            </PrivateLayout>
                          </ErrorBoundary>
                        </PrivateRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin/*"
                      element={
                        <AdminRoute>
                          <AdminProvider>
                            <ErrorBoundary>
                              <Routes>
                                <Route path="/" element={<AdminPanel />} />
                                <Route path="/dashboard" element={<AdminPanel />} />
                              </Routes>
                            </ErrorBoundary>
                          </AdminProvider>
                        </AdminRoute>
                      }
                    />

                    {/* Catch-all route */}
                    <Route 
                      path="*" 
                      element={
                        <Navigate to="/404" replace />
                      } 
                    />
                  </Routes>
                </Suspense>

                {/* Toast notifications with security config */}
                <ToastContainer
                  {...TOAST_CONFIG}
                  toastClassName="secure-toast"
                  bodyClassName="secure-toast-body"
                />
              </div>
            </SecureErrorBoundary>
          </DarkModeProvider>
        </ThemeProvider>
      </AuthProvider>
    </SecurityProvider>
  );
}

export default App;