import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
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
import { AdminProvider } from './contexts/AdminContext';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTransactions from './pages/AdminTransactions';
import AdminServices from './pages/AdminServices';
import NotFound from './pages/NotFound';

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

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  if (isLoading) return <Loading />;
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DarkModeProvider>
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
            {/* Nested Admin routes */}
            <Route
              path="/admin/*"
              element={
                <AdminProvider>
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                </AdminProvider>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="transactions" element={<AdminTransactions />} />
              <Route path="services" element={<AdminServices />} />
            </Route>
            {/* Global catch-all 404 route */}
            <Route path="*" element={<NotFound />} />
            <Route path="/test" element={<div>Test Route Works</div>} />
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
        </DarkModeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
