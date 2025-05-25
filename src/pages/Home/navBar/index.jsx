import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../images/arewa_gate_logo6.png';
import { useAuth } from '../../../contexts/AuthContext';
import { useTransactions } from '../../../contexts/TransactionContext';

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

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // Close sidebar explicitly
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Close sidebar when clicking outside or pressing Escape
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

  // Handle search submission
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
    <nav className="w-full bg-white shadow-md sticky top-0 z-50 font-nunito">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center" onClick={closeSidebar}>
          <img src={logo} alt="Arewa Gate Logo" className="h-10 md:h-12 transition-transform duration-200 hover:scale-105" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className="text-gray-700 text-base font-medium hover:text-green-500 hover:border-b-2 hover:border-green-500 pb-1 transition-all duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2 px-4 w-48 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-sm"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-500"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-500 focus:outline-none"
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

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="text-sm text-gray-500">Signed in as</div>
                    <div className="text-sm font-medium text-gray-900 truncate">{user?.email}</div>
                  </div>
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="text-sm text-gray-500">Balance</div>
                    <div className="text-sm font-medium text-gray-900">₦{walletBalance.toLocaleString()}</div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-500"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-500"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
                className="px-5 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-all duration-200"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={toggleButtonRef}
          className="lg:hidden focus:outline-none p-2"
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
          aria-expanded={isSidebarOpen}
        >
          <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden z-50 overflow-y-auto`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-200">
          <img src={logo} alt="Arewa Gate Logo" className="h-10" />
          <button onClick={closeSidebar} className="text-gray-600 hover:text-green-500" aria-label="Close Sidebar">
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
                className="flex items-center p-3 text-gray-700 hover:bg-gray-100 hover:text-green-500 rounded-md transition-all duration-200"
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
                className="w-full py-2 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-500"
                aria-label="Search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </li>
          {isAuthenticated ? (
            <li className="space-y-2">
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-lg">
                    {user?.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Signed in as</div>
                    <div className="text-sm font-medium text-gray-900 truncate">{user?.email}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500">Balance</div>
                  <div className="text-sm font-medium text-gray-900">₦{walletBalance.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-500 rounded-md"
                    onClick={closeSidebar}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-500 rounded-md"
                    onClick={closeSidebar}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeSidebar();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
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
                  to="/signup"
                  className="block w-full p-3 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 text-center"
                  onClick={closeSidebar}
                >
                  Sign up
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="block w-full bg-green-500 text-white p-3 rounded-md text-center font-medium hover:bg-green-600 transition-all duration-200"
                  onClick={closeSidebar}
                >
                  Login
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Overlay for Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
    </nav>
  );
};

export default NavBar;