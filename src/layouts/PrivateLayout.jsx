// src/layouts/PrivateLayout.jsx
import React from 'react';
import EducationalSidebar from "../components/EducationalSidebar";
import PrivateRoute from "../components/PrivateRoute";
import { useDarkMode } from "../contexts/DarkModeContext";

const PrivateLayout = ({ children }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <PrivateRoute>
      <EducationalSidebar>
        {children}
      </EducationalSidebar>
    </PrivateRoute>
  );
};

export default PrivateLayout;