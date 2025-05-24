// src/layouts/PrivateLayout.jsx
import React from 'react';
import NavandSideBar from "../components/NavandSideBar";
import PrivateRoute from "../components/PrivateRoute";

const PrivateLayout = ({ children }) => {
  return (
    <PrivateRoute>
      <NavandSideBar>
        <div className="p-4">{children}</div>
      </NavandSideBar>
    </PrivateRoute>
  );
};

export default PrivateLayout;