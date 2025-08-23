// src/components/NavandSideBar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTransactions } from "../contexts/TransactionContext";
import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import {
  BiGrid,
  BiUser,
  BiWallet,
  BiCreditCard,
  BiData,
  BiPhone,
  BiBook,
  BiListCheck,
  BiSupport,
  BiLogOut,
  BiChevronDown,
  BiChevronUp,
  BiMenu,
  BiBrain,
} from "react-icons/bi";
import { AiOutlineRobot } from "react-icons/ai";
import { toast } from "react-hot-toast";

const NavandSideBar = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const userDropdownRef = useRef(null);
  const { logout, user } = useAuth();
  const { walletBalance } = useTransactions();
  const { isDarkMode } = useDarkMode();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
        setIsCollapsed(true);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleLogout = async () => {
      const result = await logout();
      if (result.success) {
      navigate('/login');
      } else {
      console.error('Logout error:', result.error);
    }
  };

  const sidebarItems = [
    { path: "/dashboard", icon: <BiGrid />, label: "Dashboard" },
    { path: "/dashboard/profile", icon: <BiUser />, label: "Profile" },
    { path: "/dashboard/wallet", icon: <BiWallet />, label: "Wallet" },
    {
      path: "#",
      icon: <BiCreditCard />,
      label: "Scratch Cards",
      subItems: [
        { path: "/dashboard/scratch-card/waec-checker", label: "WAEC Result Checker" },
        { path: "/dashboard/scratch-card/neco-checker", label: "NECO Result Checker" },
        { path: "/dashboard/scratch-card/nbais-checker", label: "NBAIS Result Checker" },
        { path: "/dashboard/scratch-card/nabteb-checker", label: "NABTEB Result Checker" },
        { path: "/dashboard/scratch-card/waec-gce", label: "WAEC GCE" },
      ],
    },
    { path: "/dashboard/buy-data", icon: <BiData />, label: "Buy Data" },
    { path: "/dashboard/buy-airtime", icon: <BiPhone />, label: "Airtime" },
    {
      path: "#",
      icon: <BiBook />,
      label: "JAMB Services",
      subItems: [
        { path: "/dashboard/buy-olevel-upload", label: "O-Level Upload" },
        { path: "/dashboard/buy-admission-letter", label: "Admission Letter" },
        { path: "/dashboard/buy-original-result", label: "Original Result" },
        { path: "/dashboard/buy-pin-vending", label: "JAMB Pin Vending" },
        { path: "/dashboard/reprinting-jamb-caps", label: "CAPS Printing" },
      ],
    },
    { 
      path: "#",
      icon: <BiBrain />,
      label: "AI Services",
      subItems: [
        { path: "/dashboard/ai-examiner", icon: <AiOutlineRobot />, label: "AI Examiner" },
        { path: "/dashboard/course-advisor", icon: <AiOutlineRobot />, label: "Course Advisor AI" },
      ],
    },
    { path: "/dashboard/transactions", icon: <BiListCheck />, label: "Transactions" },
    { path: "/dashboard/support", icon: <BiSupport />, label: "Support" },
    { path: "/login", icon: <BiLogOut />, label: "Logout", onClick: handleLogout },
  ];

  return (
    <div className={`flex flex-col min-h-screen font-nunito relative ${
      isDarkMode ? 'bg-dark-surface' : 'bg-gray-50'
    }`}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <header className={`fixed top-0 left-0 right-0 shadow-md z-50 flex items-center justify-between px-4 py-3 transition-colors duration-200 ${
        isDarkMode ? 'bg-dark-surface text-dark-text-primary border-b border-dark-border' : 'bg-white text-gray-900'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className={`lg:hidden focus:outline-none ${
              isDarkMode ? 'text-dark-text-primary hover:text-primary-400' : 'text-gray-700 hover:text-green-500'
            }`}
            aria-label="Toggle Sidebar"
          >
            <BiMenu className="h-6 w-6" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://arewagate.com/images/general/favicon2.png"
              alt="ArewaGate Logo"
              className="h-8 w-8 transition-transform duration-200 hover:scale-105"
            />
            <span className={`text-xl font-bold hidden md:block ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>ArewaGate</span>
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className={`flex items-center space-x-2 focus:outline-none ${
                isDarkMode ? 'text-dark-text-primary hover:text-primary-400' : 'text-gray-700 hover:text-green-500'
              }`}
            >
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                {user?.email?.charAt(0)?.toUpperCase()}
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'transform rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 border ${
                isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-200'
              }`}>
                <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
                  <div className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>Signed in as</div>
                  <div className={`text-sm font-medium truncate ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
                  }`}>{user?.email}</div>
                </div>
                <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-dark-border' : 'border-gray-200'}`}>
                  <div className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>Balance</div>
                  <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
                  }`}>₦{(walletBalance || 0).toLocaleString()}</div>
                </div>
                <Link
                  to="/dashboard"
                  className={`block px-4 py-2 text-sm ${
                    isDarkMode 
                      ? 'text-dark-text-primary hover:bg-dark-border hover:text-primary-400' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-green-500'
                  }`}
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/profile"
                  className={`block px-4 py-2 text-sm ${
                    isDarkMode 
                      ? 'text-dark-text-primary hover:bg-dark-border hover:text-primary-400' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-green-500'
                  }`}
                  onClick={() => setIsUserDropdownOpen(false)}
                >
                  Profile
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`block px-4 py-2 text-sm font-medium ${
                      isDarkMode 
                        ? 'text-primary-400 hover:bg-dark-border hover:text-primary-300' 
                        : 'text-green-600 hover:bg-green-50 hover:text-green-700'
                    }`}
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    🛡️ Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsUserDropdownOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${
                    isDarkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-100'
                  }`}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <aside
        ref={sidebarRef}
        className={`fixed top-16 bottom-0 transition-all duration-300 ease-in-out z-50 ${
          isDarkMode ? 'bg-dark-surface border-r border-dark-border' : 'bg-white shadow-lg'
        } ${isSidebarOpen ? 'left-0' : '-left-64'} lg:left-0
          w-64 lg:w-auto lg:min-w-[4rem] ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}
        style={{ maxHeight: "calc(100vh - 4rem)", overflowY: "auto" }}
        onMouseEnter={() => !isSidebarOpen && window.innerWidth >= 1024 && setIsCollapsed(false)}
        onMouseLeave={() => !isSidebarOpen && window.innerWidth >= 1024 && setIsCollapsed(true)}
      >
        <ul className="p-3 space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <div
                className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path || item.subItems?.some((sub) => sub.path === location.pathname)
                    ? "bg-green-500 text-white"
                    : isDarkMode
                      ? "text-dark-text-primary hover:bg-dark-border hover:text-primary-400"
                      : "text-gray-700 hover:bg-gray-100 hover:text-green-500"
                }`}
              >
                <Link
                  to={item.path}
                  className="flex items-center flex-grow"
                  onClick={item.onClick || null}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`ml-3 ${(isCollapsed && window.innerWidth >= 1024) || (!isSidebarOpen && window.innerWidth < 1024) ? "hidden" : "block"} text-sm font-medium`}>
                    {item.label}
                  </span>
                </Link>
                {item.subItems && (
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`p-1 ${(isCollapsed && window.innerWidth >= 1024) || (!isSidebarOpen && window.innerWidth < 1024) ? "hidden" : "block"} ${
                      isDarkMode ? 'hover:bg-dark-border' : 'hover:bg-gray-200'
                    } rounded-full`}
                  >
                    {openDropdown === item.label ? (
                      <BiChevronUp className="text-lg" />
                    ) : (
                      <BiChevronDown className="text-lg" />
                    )}
                  </button>
                )}
              </div>
              {item.subItems && openDropdown === item.label && (
                <ul className={`pl-8 mt-1 space-y-1 ${(isCollapsed && window.innerWidth >= 1024) || (!isSidebarOpen && window.innerWidth < 1024) ? "hidden" : "block"}`}>
                  {item.subItems.map((subItem) => (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        className={`block p-2 rounded-lg text-sm transition-all duration-200 ${
                          location.pathname === subItem.path
                            ? isDarkMode
                              ? "bg-dark-border text-primary-400 font-semibold"
                              : "bg-green-100 text-green-500 font-semibold"
                            : isDarkMode
                              ? "text-dark-text-secondary hover:bg-dark-border hover:text-primary-400"
                              : "text-gray-600 hover:bg-gray-100 hover:text-green-500"
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <main
        className={`transition-all duration-300 ease-in-out pt-16 flex-grow
          ${isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0 lg:ml-16'}
          ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        `}
        onClick={() => isSidebarOpen && window.innerWidth < 1024 && setIsSidebarOpen(false)}
      >
        <div className="transition-opacity duration-300">
          {children}
        </div>
      </main>
    </div>
  );
};

export default NavandSideBar;
