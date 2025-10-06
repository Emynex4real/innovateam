import React, { createContext, useContext, useEffect, useState } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if running in a browser environment
    if (typeof window === 'undefined') {
      return false;
    }

    // Check for saved preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }

    // Default to light mode instead of system preference
    return false;
  });

  // Initialize dark mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check both darkMode and theme keys for compatibility
      const savedDarkMode = localStorage.getItem('darkMode');
      const savedTheme = localStorage.getItem('theme');
      
      let isDark = false;
      if (savedDarkMode !== null) {
        isDark = savedDarkMode === 'true';
      } else if (savedTheme !== null) {
        isDark = savedTheme === 'dark';
      }
      
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('darkMode', isDark.toString());
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', isDarkMode.toString());
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}; 