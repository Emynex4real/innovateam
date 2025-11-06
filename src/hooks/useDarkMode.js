import { useEffect } from 'react';
import { create } from 'zustand';
import { LOCAL_STORAGE_KEYS } from '../config/constants';

const useDarkModeStore = create((set) => ({
  isDarkMode: false,
  setDarkMode: (value) => {
    set({ isDarkMode: value });
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, value ? 'dark' : 'light');
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
}));

const useDarkMode = () => {
  const { isDarkMode, setDarkMode } = useDarkModeStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME);
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, [setDarkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem(LOCAL_STORAGE_KEYS.THEME)) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setDarkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode);
  };

  return {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  };
};

export default useDarkMode; 