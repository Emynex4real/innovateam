import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import Logo from '../../../components/ui/logo';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../contexts/SupabaseAuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const NavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const isAuthenticated = !!user;
  const walletBalance = 0; // Mock data for now
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        setIsSidebarOpen(false);
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSidebarOpen(false);
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/course-advisor', label: 'Course Advisor' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? isDarkMode 
            ? 'bg-black/95 backdrop-blur-md border-b border-gray-800/50 shadow-lg' 
            : 'bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg'
          : isDarkMode
            ? 'bg-transparent'
            : 'bg-white shadow-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <Logo 
                size="md" 
                textColor={isDarkMode ? "white" : "dark"} 
                className="transition-all duration-300 group-hover:scale-105" 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <ul className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className={`text-sm font-medium transition-all duration-300 relative group ${
                        isDarkMode 
                          ? 'text-gray-300 hover:text-green-400' 
                          : isScrolled 
                            ? 'text-gray-700 hover:text-green-600' 
                            : 'text-gray-900 hover:text-green-600'
                      }`}
                    >
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Search */}
              <div className="relative">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-48 px-4 py-2 pl-10 rounded-full border transition-all duration-300 text-sm ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:bg-gray-800 focus:border-green-500' 
                        : isScrolled
                          ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                          : 'bg-white/90 border-gray-300 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-green-500'
                    } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                  />
                  <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    isDarkMode 
                      ? 'text-gray-400' 
                      : isScrolled 
                        ? 'text-gray-500' 
                        : 'text-gray-500'
                  }`} />
                </form>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-800' 
                    : isScrolled
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>

              {/* Auth Section */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-full transition-all duration-300 ${
                      isDarkMode 
                        ? 'hover:bg-gray-800' 
                        : isScrolled
                          ? 'hover:bg-gray-100'
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-sm">
                        {user?.email?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className={`text-sm font-medium ${
                        isDarkMode 
                          ? 'text-white' 
                          : isScrolled 
                            ? 'text-gray-900' 
                            : 'text-gray-900'
                      }`}>
                        {user?.name || user?.email?.split('@')[0]}
                      </div>
                      <div className={`text-xs ${
                        isDarkMode 
                          ? 'text-green-400' 
                          : isScrolled 
                            ? 'text-green-600' 
                            : 'text-green-600'
                      }`}>
                        ₦{walletBalance.toLocaleString()}
                      </div>
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border backdrop-blur-md ${
                      isDarkMode 
                        ? 'bg-gray-900/95 border-gray-700' 
                        : 'bg-white/95 border-gray-200'
                    } overflow-hidden`}>
                      <div className={`px-4 py-3 border-b ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user?.email}
                        </div>
                        <div className={`text-xs mt-1 ${
                          isDarkMode ? 'text-green-400' : 'text-green-600'
                        }`}>
                          Balance: ₦{walletBalance.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isDarkMode 
                              ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isDarkMode 
                              ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setIsDropdownOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm text-red-500 transition-colors ${
                            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-red-50'
                          }`}
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button 
                    asChild 
                    variant="ghost" 
                    size="sm"
                    className={`transition-all duration-300 ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                        : isScrolled
                          ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button 
                    asChild 
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={toggleButtonRef}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                  : isScrolled
                    ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 right-0 w-80 transform transition-transform duration-300 ease-in-out lg:hidden z-50 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDarkMode ? 'bg-gray-900/95' : 'bg-white/95'
        } backdrop-blur-md border-l ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-8">
            <Logo 
              size="md" 
              textColor={isDarkMode ? "white" : "dark"} 
            />
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="space-y-2 mb-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`block px-4 py-3 rounded-xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-3 pl-10 rounded-xl border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-green-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
              />
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
            </div>
          </form>

          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors mb-8 ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>Theme</span>
            {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Mobile Auth */}
          {isAuthenticated ? (
            <div className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.email?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.name || user?.email?.split('@')[0]}
                  </div>
                  <div className={`text-sm ${
                    isDarkMode ? 'text-green-400' : 'text-green-600'
                  }`}>
                    ₦{walletBalance.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className={`block w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  className={`block w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsSidebarOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm text-red-500 transition-colors ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-red-50'
                  }`}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button 
                asChild 
                variant="outline" 
                className={`w-full ${
                  isDarkMode 
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Link to="/login">Sign In</Link>
              </Button>
              <Button 
                asChild 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                onClick={() => setIsSidebarOpen(false)}
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default NavBar;