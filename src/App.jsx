import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PublicLayout from './layouts/PublicLayout';
import AuthenticatedLayout from './layouts/AuthenticatedLayout';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import { publicRoutes, privateRoutes } from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
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
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
