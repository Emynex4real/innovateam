// src/layouts/PrivateLayout.jsx
import React from 'react';
import NavandSideBar from "../components/NavandSideBar";
import PrivateRoute from "../components/PrivateRoute";
import { useDarkMode } from "../contexts/DarkModeContext";

const PrivateLayout = ({ children }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <PrivateRoute>
      <NavandSideBar>
        <div className={`p-4 transition-colors duration-200 ${
          isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-50 text-gray-900'
        }`}>{children}</div>
      </NavandSideBar>
    </PrivateRoute>
  );
};

export default PrivateLayout;