import React from 'react';
// import NavBar from './NavBar';
import NavBar from './navbar/index';

const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow p-4">
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;