import React from 'react';
import { TransactionProvider } from '../contexts/TransactionContext';
import NavBar from './navbar/index';

const AuthenticatedLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <TransactionProvider>
      <NavBar />
      <main className="flex-grow p-6">
        {children}
      </main>
    </TransactionProvider>
  </div>
);

export default AuthenticatedLayout;
