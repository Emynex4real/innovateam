import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import {
  HomeIcon,
  UserIcon,
  WalletIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  LightBulbIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const EducationalSidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  
  const { user, logout } = useAuth();
  const { walletBalance } = useWallet();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      path: '/dashboard'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      path: '/dashboard/profile'
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: WalletIcon,
      path: '/dashboard/wallet'
    },
    {
      id: 'scratch-cards',
      label: 'Result Checkers',
      icon: DocumentTextIcon,
      isGroup: true,
      children: [
        { label: 'WAEC Checker', path: '/dashboard/scratch-card/waec-checker' },
        { label: 'NECO Checker', path: '/dashboard/scratch-card/neco-checker' },
        { label: 'NBAIS Checker', path: '/dashboard/scratch-card/nbais-checker' },
        { label: 'NABTEB Checker', path: '/dashboard/scratch-card/nabteb-checker' },
        { label: 'WAEC GCE', path: '/dashboard/scratch-card/waec-gce' }
      ]
    },
    {
      id: 'jamb-services',
      label: 'JAMB Services',
      icon: AcademicCapIcon,
      isGroup: true,
      children: [
        { label: 'O-Level Upload', path: '/dashboard/buy-olevel-upload' },
        { label: 'Admission Letter', path: '/dashboard/buy-admission-letter' },
        { label: 'Original Result', path: '/dashboard/buy-original-result' },
        { label: 'Pin Vending', path: '/dashboard/buy-pin-vending' },
        { label: 'CAPS Printing', path: '/dashboard/reprinting-jamb-caps' }
      ]
    },
    {
      id: 'ai-services',
      label: 'AI Services',
      icon: LightBulbIcon,
      isGroup: true,
      children: [
        { label: 'AI Examiner', path: '/dashboard/ai-examiner' },
        { label: 'Course Advisor (AI)', path: '/dashboard/course-advisor' },
        { label: 'Course Recommender', path: '/dashboard/course-advisor/recommender' }
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ClipboardDocumentListIcon,
      path: '/dashboard/transactions'
    },
    {
      id: 'support',
      label: 'Support',
      icon: QuestionMarkCircleIcon,
      path: '/dashboard/support'
    }
  ];

  // Add admin panel for admin users
  const finalMenuItems = [...menuItems];
  if (user?.isAdmin) {
    finalMenuItems.push({
      id: 'admin-panel',
      label: 'Admin Panel',
      icon: ShieldCheckIcon,
      path: '/admin/dashboard',
      isAdmin: true
    });
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const isActiveItem = (item) => {
    if (item.path) return location.pathname === item.path;
    if (item.children) return item.children.some(child => location.pathname === child.path);
    return false;
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              {isOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                InnovaTeam
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                </div>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${showUserDropdown ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>

              {showUserDropdown && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`px-4 py-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || user?.email?.split('@')[0]}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {user?.email}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-1">
                      ₦{(walletBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      to="/dashboard/profile"
                      className={`block px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setShowUserDropdown(false)}
                    >
                      Profile Settings
                    </Link>
                    
                    {user?.isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className={`block px-4 py-2 text-sm font-medium text-orange-600 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-orange-50'}`}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        🛡️ Admin Panel
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'}`}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-14 bottom-0 z-40 w-64 transition-transform duration-300 ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        } border-r ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-4 h-full overflow-y-auto">
          {/* Wallet Balance */}
          <div className={`mb-6 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Wallet Balance
              </span>
              <WalletIcon className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-600 mt-1">
              ₦{(walletBalance || 0).toLocaleString()}
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {finalMenuItems.map((item) => {
              const isActive = isActiveItem(item);
              const isExpanded = expandedGroups[item.id];

              if (item.isGroup) {
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => toggleGroup(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        isActive
                          ? isDarkMode
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600 text-white'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-800'
                            : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-1 ml-8 space-y-1">
                        {item.children.map((child, index) => (
                          <Link
                            key={index}
                            to={child.path}
                            className={`block p-2 rounded-md text-sm transition-colors ${
                              location.pathname === child.path
                                ? isDarkMode
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-blue-500 text-white'
                                : isDarkMode
                                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                      : item.isAdmin
                        ? isDarkMode
                          ? 'text-orange-400 hover:bg-orange-900/20'
                          : 'text-orange-600 hover:bg-orange-50'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-800'
                          : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">
                    {item.isAdmin && '🛡️ '}{item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center p-3 rounded-lg transition-colors text-red-600 ${
                isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
              }`}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14">
        {children}
      </main>
    </div>
  );
};

export default EducationalSidebar;