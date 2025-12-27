import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';

const MobileBottomNav = ({ role = 'student' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useDarkMode();

  const isActive = (path) => location.pathname.startsWith(path);

  const studentNav = [
    { path: '/student', icon: '🏠', label: 'Home' },
    { path: '/student/tests', icon: '📝', label: 'Tests' },
    { path: '/student/analytics', icon: '📊', label: 'Progress' },
    { path: '/student/leaderboard', icon: '🏆', label: 'Rank' },
  ];

  const tutorNav = [
    { path: '/tutor', icon: '🏠', label: 'Home' },
    { path: '/tutor/questions', icon: '❓', label: 'Questions' },
    { path: '/tutor/tests', icon: '📝', label: 'Tests' },
    { path: '/tutor/students', icon: '👥', label: 'Students' },
  ];

  const navItems = role === 'tutor' ? tutorNav : studentNav;

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t ${
        isDarkMode
          ? 'bg-gray-900/95 border-gray-800'
          : 'bg-white/95 border-gray-200'
      } backdrop-blur-lg safe-area-bottom`}
    >
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive(item.path)
                ? isDarkMode
                  ? 'text-blue-400'
                  : 'text-blue-600'
                : isDarkMode
                ? 'text-gray-400'
                : 'text-gray-600'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
