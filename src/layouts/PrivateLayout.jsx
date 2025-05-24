import React from "react";
import NavandSideBar from "./navandsidebar";
// import NavandSideBar from "../pages/navandsidebar/index"; // Correct path

const PrivateLayout = ({ children }) => (
  <NavandSideBar>
    <div className="min-h-screen p-4 ml-16 md:ml-4">{children}</div>
  </NavandSideBar>
);

export default PrivateLayout;