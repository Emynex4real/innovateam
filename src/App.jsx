import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PublicLayout from './layouts/PublicLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { publicRoutes, privateRoutes } from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DarkModeProvider>
          <Router>
            <Routes>
              {publicRoutes.map(({ path, element, title }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <PublicRoute>
                      <PublicLayout>
                        <Suspense fallback={<Loading />}>
                          {element}
                        </Suspense>
                      </PublicLayout>
                    </PublicRoute>
                  }
                />
              ))}
              {privateRoutes.map(({ path, element, title }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <PrivateRoute>
                      <AuthenticatedLayout>
                        <Suspense fallback={<Loading />}>
                          {element}
                        </Suspense>
                      </AuthenticatedLayout>
                    </PrivateRoute>
                  }
                />
              ))}
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Router>
        </DarkModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
