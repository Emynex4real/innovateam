import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSun, FiMoon } from 'react-icons/fi';
import Logo from '../../../components/ui/logo';
import { useAuth } from '../../../contexts/AuthContext';
import { useTransactions } from '../../../contexts/TransactionContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const NavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { walletBalance } = useTransactions();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        closeSidebar();
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        closeSidebar();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      closeSidebar();
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/blogs', label: 'Blogs', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  ];

  return (
    <nav className="w-full bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50 font-nunito">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center" onClick={closeSidebar}>
          <Logo size="md" textColor="white" className="transition-transform duration-200 hover:scale-105" />
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="text-base font-medium text-white hover:text-green-400 transition-all duration-200 hover:border-b-2 hover:border-green-500 pb-1"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 px-4 w-48 rounded-md border bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-white hover:text-green-400 focus:outline-none"
              >
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  {user?.email?.charAt(0)?.toUpperCase()}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-700">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <div className="text-sm text-gray-400">Signed in as</div>
                    <div className="text-sm font-medium text-white truncate">{user?.email}</div>
                  </div>
                  <div className="px-4 py-2 border-b border-gray-700">
                    <div className="text-sm text-gray-400">Balance</div>
                    <div className="text-sm font-medium text-green-400">₦{walletBalance.toLocaleString()}</div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-800 hover:text-green-400"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-white hover:bg-gray-800 hover:text-green-400"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/register"
                className="px-5 py-2 rounded-md border border-green-600 text-sm font-medium text-green-400 hover:bg-green-600 hover:text-white transition-all duration-200"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-all duration-200"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 lg:hidden">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <button
            ref={toggleButtonRef}
            onClick={toggleSidebar}
            className="p-2 rounded-md text-white hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 right-0 w-64 transform transition-transform duration-300 ease-in-out lg:hidden z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-gray-900 border-l border-gray-800`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-800">
          <Logo size="sm" textColor="white" />
          <button 
            onClick={closeSidebar} 
            className="text-gray-400 hover:text-white" 
            aria-label="Close Sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="p-5 space-y-4">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.path}
                className="flex items-center p-3 text-white hover:bg-gray-800 hover:text-green-400 rounded-md transition-all duration-200"
                onClick={closeSidebar}
              >
                <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <form onSubmit={handleSearch} className="relative mt-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 px-4 rounded-md border bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400"
                aria-label="Search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </li>
          {isAuthenticated ? (
            <li>
              <div className="p-3 border-t border-gray-800">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-lg">
                    {user?.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Signed in as</div>
                    <div className="text-sm font-medium text-white truncate">{user?.email}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-sm font-medium text-green-400">₦{walletBalance.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="block w-full px-4 py-2 text-sm text-white hover:bg-gray-800 hover:text-green-400 rounded-md"
                    onClick={closeSidebar}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    className="block w-full px-4 py-2 text-sm text-white hover:bg-gray-800 hover:text-green-400 rounded-md"
                    onClick={closeSidebar}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeSidebar();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-md"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </li>
          ) : (
            <>
              <li>
                <Link
                  to="/register"
                  className="block w-full p-3 rounded-md border border-green-600 text-sm font-medium text-green-400 hover:bg-green-600 hover:text-white transition-all duration-200 text-center"
                  onClick={closeSidebar}
                >
                  Sign up
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="block w-full bg-green-600 text-white p-3 rounded-md text-center font-medium hover:bg-green-700 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={closeSidebar}
        />
      )}
    </nav>
  );
};

export default NavBar;