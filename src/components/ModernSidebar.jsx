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
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ModernSidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [notifications, setNotifications] = useState(3);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: HomeIcon,
      path: '/dashboard',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      path: '/dashboard/profile',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: WalletIcon,
      path: '/dashboard/wallet',
      color: 'from-green-500 to-emerald-500',
      badge: `₦${(balance || 0).toLocaleString()}`
    },
    {
      id: 'scratch-cards',
      label: 'Result Checkers',
      icon: DocumentTextIcon,
      color: 'from-orange-500 to-red-500',
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
      color: 'from-indigo-500 to-purple-500',
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
      icon: SparklesIcon,
      color: 'from-violet-500 to-purple-500',
      isGroup: true,
      new: true,
        children: [
          { label: 'AI Examiner', path: '/dashboard/ai-examiner', new: true },
          { label: 'Course Advisor (Dashboard)', path: '/dashboard/course-advisor', new: true },
          { label: 'Course Advisor (Legacy)', path: '/course-advisor', new: true }
        ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ClipboardDocumentListIcon,
      path: '/dashboard/transactions',
      color: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'support',
      label: 'Support',
      icon: QuestionMarkCircleIcon,
      path: '/dashboard/support',
      color: 'from-amber-500 to-orange-500'
    }
  ];

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

  const MenuItem = ({ item, isChild = false }) => {
    const isActive = isActiveItem(item);
    const isExpanded = expandedGroups[item.id];

    if (item.isGroup) {
      return (
        <div className="mb-1">
          <button
            onClick={() => toggleGroup(item.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
              isActive
                ? isDarkMode
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} ${isActive ? 'shadow-lg' : 'opacity-70 group-hover:opacity-100'} transition-all duration-300`}>
                <item.icon className="h-5 w-5 text-white" />
              </div>
              {(!isCollapsed || isOpen) && (
                <div className="ml-3 flex items-center">
                  <span className="font-semibold">{item.label}</span>
                  {item.new && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full font-bold animate-pulse">
                      NEW
                    </span>
                  )}
                </div>
              )}
            </div>
            {(!isCollapsed || isOpen) && (
              <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </button>
          
          {isExpanded && (!isCollapsed || isOpen) && (
            <div className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {item.children.map((child, index) => (
                <Link
                  key={index}
                  to={child.path}
                  className={`flex items-center p-2 rounded-lg transition-all duration-200 ${
                    location.pathname === child.path
                      ? isDarkMode
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-blue-500 text-white shadow-md'
                      : isDarkMode
                        ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-current opacity-50 mr-3"></div>
                  <span className="text-sm font-medium">{child.label}</span>
                  {child.new && (
                    <span className="ml-auto px-1.5 py-0.5 text-xs bg-green-500 text-white rounded-full">
                      NEW
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item.path}
        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 group mb-1 ${
          isActive
            ? isDarkMode
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
            : isDarkMode
              ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} ${isActive ? 'shadow-lg' : 'opacity-70 group-hover:opacity-100'} transition-all duration-300`}>
            <item.icon className="h-5 w-5 text-white" />
          </div>
          {(!isCollapsed || isOpen) && (
            <span className="ml-3 font-semibold">{item.label}</span>
          )}
        </div>
        {(!isCollapsed || isOpen) && item.badge && (
          <span className={`px-2 py-1 text-xs rounded-full font-bold ${
            isActive ? 'bg-white/20 text-white' : 'bg-green-100 text-green-800'
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
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
      <header className={`fixed top-0 left-0 right-0 z-50 ${isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
            
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ArewaGate
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <button className={`relative p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <BellIcon className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="hidden md:block">
                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || user?.email?.split('@')[0]}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ₦{(balance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-16 bottom-0 z-40 transition-all duration-300 ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        } border-r shadow-xl ${
          isOpen ? 'left-0' : '-left-80'
        } lg:left-0 ${
          isCollapsed ? 'lg:w-20' : 'lg:w-80'
        } w-80`}
        onMouseEnter={() => window.innerWidth >= 1024 && setIsCollapsed(false)}
        onMouseLeave={() => window.innerWidth >= 1024 && setIsCollapsed(true)}
      >
        <div className="p-4 h-full overflow-y-auto">
          {/* User Profile Section */}
          {(!isCollapsed || isOpen) && (
            <div className={`mb-6 p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Student
                  </p>
                </div>
              </div>
              <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Wallet Balance
                  </span>
                  <span className="font-bold text-green-500">
                    ₦{(balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <Link
              to="/dashboard/profile"
              className={`flex items-center p-3 rounded-xl transition-all duration-300 ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Cog6ToothIcon className="h-5 w-5" />
              {(!isCollapsed || isOpen) && <span className="ml-3 font-semibold">Settings</span>}
            </Link>
            
            <button
              onClick={handleLogout}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 text-red-500 ${
                isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
              }`}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {(!isCollapsed || isOpen) && <span className="ml-3 font-semibold">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 pt-16 ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-80'
      }`}>
        {children}
      </main>
    </div>
  );
};

export default ModernSidebar;