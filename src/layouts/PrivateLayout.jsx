import React from 'react';
// import NavandSideBar from './NavandSideBar';
import NavandSideBar from './navandsidebar/index';

const PrivateLayout = ({ children }) => (
  <NavandSideBar>
    <div className="min-h-screen p-4 ml-16 md:ml-0">{children}</div>
  </NavandSideBar>
);

export default PrivateLayout;