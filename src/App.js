// src/App.js
import React, { Suspense, useEffect, useMemo } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import PublicLayout from "./layouts/PublicLayout";
import PrivateLayout from "./layouts/PrivateLayout";
import publicRoutes from "./routes/publicRoutes";
import privateRoutes from "./routes/privateRoutes";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { TransactionProvider } from "./contexts/TransactionContext";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 p-4">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <h1 className="text-2xl font-bold text-white font-poppins">Something went wrong</h1>
            <p className="mt-2 text-gray-200">{this.state.error?.message || "An unexpected error occurred."}</p>
            <details className="mt-4 text-sm text-gray-300">
              <summary>Show error details</summary>
              <pre className="mt-2 p-2 bg-black/20 rounded">{this.state.errorInfo?.componentStack}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 py-2 px-4 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-all"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
    const currentRoute = allRoutes.find((route) => route.path === location.pathname);
    document.title = currentRoute?.title ? `${currentRoute.title} | ArewaGate` : "ArewaGate";
  }, [location, allRoutes]);

  return (
    <AuthProvider>
      <TransactionProvider>
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <Routes>
              {publicRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<PublicLayout>{route.element}</PublicLayout>}
                />
              ))}
              <Route
                path="/dashboard/*"
                element={
                  <PrivateRoute>
                    <PrivateLayout>
                      <Routes>
                        {privateRoutes.map((route) => (
                          <Route
                            key={route.path}
                            path={route.path}
                            element={route.element}
                          />
                        ))}
                      </Routes>
                    </PrivateLayout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;