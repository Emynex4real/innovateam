// src/layouts/PublicLayout.jsx
import React from "react";
import ErrorBoundary from "../components/ErrorBoundary";

const PublicLayout = ({ children }) => (
  <ErrorBoundary>
    <div className="min-h-screen bg-gray-50">{children}</div>
  </ErrorBoundary>
);

export default PublicLayout;