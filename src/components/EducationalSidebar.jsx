import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useWallet } from '../contexts/WalletContext';
import supabase from '../config/supabase';
import NotificationCenter from './NotificationCenter';
import {
  BiHome as HomeIcon,
  BiUser as UserIcon,
  BiWallet as WalletIcon,
  BiBrain as BrainIcon,
  BiGroup as UsersIcon,
  BiBookOpen as BookOpenIcon,
  BiListCheck as ClipboardDocumentListIcon,
  BiSupport as QuestionMarkCircleIcon,
  BiLogOut as ArrowRightOnRectangleIcon,
  BiChevronDown as ChevronDownIcon,
  BiMenu as Bars3Icon,
  BiX as XMarkIcon,
  BiSun as SunIcon,
  BiMoon as MoonIcon,
  BiShield as ShieldCheckIcon,
  BiCreditCard as CreditCardIcon
} from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';

const EducationalSidebar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const { user, signOut } = useAuth();
  const { unreadCount } = useUnreadMessages();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { walletBalance } = useWallet();

  // --- Logic: Check Admin Status ---
  const [userRole, setUserRole] = useState('student');
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      const role = data?.role || 'student';
      setUserRole(role);
      setIsAdmin(role === 'admin');
    };
    checkUserRole();
  }, [user]);

  // --- Logic: Click Outside to Close Dropdowns ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close sidebar on mobile
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      // Close user dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Navigation Config ---
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { id: 'profile', label: 'Profile', icon: UserIcon, path: '/dashboard/profile' },
    { id: 'wallet', label: 'Wallet', icon: WalletIcon, path: '/dashboard/wallet' },
    {
      id: 'ai-services',
      label: 'AI Services',
      icon: BrainIcon,
      isGroup: true,
      children: [
        { label: 'AI Examiner', path: '/dashboard/ai-examiner' },
        { label: 'Course Advisor (AI)', path: '/dashboard/course-advisor' },
        { label: 'Practice Questions', path: '/dashboard/practice-questions' },
        { label: 'Performance Analytics', path: '/dashboard/analytics' },
        { label: 'Leaderboard', path: '/dashboard/leaderboard' }
      ]
    },
    {
      id: 'collaboration',
      label: 'Collaboration',
      icon: UsersIcon,
      isGroup: true,
      children: [
        { label: 'Messages', path: '/student/messaging' },
        { label: 'Forums', path: '/student/forums' },
        { label: 'Study Groups', path: '/student/study-groups' },
        { label: 'Tutoring', path: '/student/tutoring' }
      ]
    },
    { id: 'tutorial-center', label: 'Tutorial Center', icon: BookOpenIcon, path: userRole === 'student' ? '/student/centers' : '/tutor' },
    { id: 'transactions', label: 'Transactions', icon: ClipboardDocumentListIcon, path: '/dashboard/transactions' },
    { id: 'support', label: 'Support', icon: QuestionMarkCircleIcon, path: '/dashboard/support' }
  ];

  if (isAdmin) {
    menuItems.push({
      id: 'admin-panel', label: 'Admin Panel', icon: ShieldCheckIcon, path: '/admin/dashboard', isAdmin: true
    });
  }

  // --- Actions ---
  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const isActiveItem = (item) => {
    if (item.path) return location.pathname === item.path;
    if (item.children) return item.children.some(child => location.pathname === child.path);
    return false;
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      
      {/* Mobile Overlay with Blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md shadow-sm transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo & Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
            
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-lg font-bold tracking-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                InnovaTeam
              </span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <NotificationCenter />
            
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl transition-all ${
                isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className={`flex items-center space-x-2 p-1.5 rounded-full border transition-all ${
                  isDarkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <ChevronDownIcon className={`h-4 w-4 hidden md:block transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border z-50 overflow-hidden ${
                      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                      <p className="text-sm font-bold truncate">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className={`flex items-center px-4 py-2.5 text-sm rounded-xl transition-colors ${
                          isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                        }`}
                      >
                         <UserIcon className="w-4 h-4 mr-3 text-gray-400" /> Profile
                      </Link>
                      
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowUserDropdown(false)}
                          className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-orange-500 transition-colors ${
                            isDarkMode ? 'hover:bg-orange-500/10' : 'hover:bg-orange-50'
                          }`}
                        >
                          <ShieldCheckIcon className="w-4 h-4 mr-3" /> Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-4 py-2.5 text-sm rounded-xl text-red-500 transition-colors ${
                          isDarkMode ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                        }`}
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* --- SIDEBAR --- */}
      <aside
        ref={sidebarRef}
        className={`fixed top-14 bottom-0 z-40 w-72 transition-transform duration-300 border-r shadow-sm ${
          isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          
          {/* Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            
            {/* Wallet "Credit Card" Widget */}
            <div className={`relative overflow-hidden rounded-2xl p-5 shadow-lg group transition-all duration-300 hover:shadow-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700' 
                : 'bg-gradient-to-br from-gray-900 to-gray-800 text-white'
            }`}>
               {/* Decorative Circle */}
               <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/20 rounded-full blur-2xl group-hover:bg-green-500/30 transition-all"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                 <div>
                   <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Balance</p>
                   <p className="text-2xl font-bold text-white mt-1">₦{(walletBalance || 0).toLocaleString()}</p>
                 </div>
                 <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                   <CreditCardIcon className="w-5 h-5 text-green-400" />
                 </div>
               </div>
               
               <Link 
                 to="/dashboard/wallet"
                 className="block w-full py-2 text-center text-xs font-bold uppercase tracking-wide bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors shadow-lg shadow-green-900/20"
               >
                 Fund Wallet
               </Link>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = isActiveItem(item);
                const isExpanded = expandedGroups[item.id];

                // --- GROUP ITEM (Dropdown) ---
                if (item.isGroup) {
                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        onClick={() => toggleGroup(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} opacity-50`} />
                      </button>
                      
                      {/* Animated Sub-menu */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800 space-y-1 my-1">
                              {item.children.map((child, index) => {
                                const isChildActive = location.pathname === child.path;
                                return (
                                  <Link
                                    key={index}
                                    to={child.path}
                                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                                      isChildActive
                                        ? 'bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    }`}
                                  >
                                    {child.label}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                // --- SINGLE ITEM ---
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-green-600 text-white shadow-md shadow-green-500/20 font-medium'
                        : item.isAdmin
                          ? 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-white' : item.isAdmin ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span>{item.isAdmin ? 'Admin Panel' : item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Sign Out
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-2">
              © {new Date().getFullYear()} InnovaTeam v1.2
            </p>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 lg:ml-72 pt-16 px-4 md:px-8 pb-8 w-full max-w-[100vw] overflow-x-hidden">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default EducationalSidebar;