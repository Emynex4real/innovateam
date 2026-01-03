import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/logo';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../../components/ui/button';

const NavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const sidebarRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
        !toggleButtonRef.current.contains(event.target) // Exclude toggle button
      ) {
        closeSidebar();
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
      closeSidebar(); // Close sidebar after search
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/blogs', label: 'Blogs', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  ];

  return (
    <nav className={`w-full sticky top-0 z-50 font-nunito transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 shadow-lg' : 'bg-white shadow-md'
    }`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center" onClick={closeSidebar}>
          <Logo size="md" className="transition-transform duration-200 hover:scale-105" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <ul className="flex gap-6">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`text-base font-medium pb-1 transition-all duration-200 relative group ${
                    isDarkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-700 hover:text-green-500'
                  }`}
                >
                  {item.label}
                  <span className={`absolute left-0 bottom-0 w-full h-0.5 bg-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                    isDarkMode ? 'bg-green-400' : 'bg-green-500'
                  }`}></span>
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
              className={`py-2 px-4 w-48 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-sm ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              type="submit"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-500'
              }`}
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className={`rounded-full ${
              isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Login Button */}
          <Link
            to="/login"
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-md font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm shadow-md"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className={`rounded-full mr-2 ${
              isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <button
            ref={toggleButtonRef}
            className={`focus:outline-none p-2 rounded-md ${
              isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Menu"
            aria-expanded={isSidebarOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isSidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-72 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:hidden z-50 overflow-y-auto ${
          isDarkMode ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'
        }`}
      >
        <div className={`p-5 flex justify-between items-center border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <Logo size="sm" />
          <button onClick={closeSidebar} className={`p-2 rounded-md ${
            isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
          }`} aria-label="Close Sidebar">
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
                className={`flex items-center p-3 rounded-md transition-all duration-200 ${
                  isDarkMode ? 'text-gray-300 hover:bg-gray-800 hover:text-green-400' : 'text-gray-700 hover:bg-gray-100 hover:text-green-500'
                }`}
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
                className={`w-full py-2 px-4 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <button
                type="submit"
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-500 hover:text-green-500'
                }`}
                aria-label="Search"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </li>
          <li>
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-md text-center font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md"
              onClick={closeSidebar}
            >
              Login
            </Link>
          </li>
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
