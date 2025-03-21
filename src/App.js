import React, { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import { publicRoutes, privateRoutes } from './routes';
import PrivateRoute from './components/privateRouter/index';
import { AuthProvider } from './components/auth/index';
import { useLocation } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

function App() {

  const location = useLocation();

  const allRoutes = [
    ...publicRoutes,
    ...privateRoutes.map((route) => ({
      ...route,
      path: `/homepage${route.path === '/' ? '' : route.path}`,
    })),
  ];

  useEffect(() => {
    const currentRoute = allRoutes.find((route) => route.path === location.pathname);
    document.title = currentRoute?.title ? `${currentRoute.title} | My App` : 'My App';
  }, [location, allRoutes]);

  return (
    <AuthProvider>
      <ErrorBoundary>
        <Routes>
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PublicLayout>
                  <Suspense fallback={<div>Loading...</div>}>
                    {route.element}
                  </Suspense>
                </PublicLayout>
              }
            />
          ))}

          <Route
            path="/homepage/*"
            element={
              <PrivateRoute>
                <PrivateLayout>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                      {privateRoutes.map((route) => (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={route.element}
                        />
                      ))}
                    </Routes>
                  </Suspense>
                </PrivateLayout>
              </PrivateRoute>
            }
          />
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;