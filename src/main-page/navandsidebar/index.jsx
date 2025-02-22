import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
} from 'react-icons/bi';
import Dropdown from '../dropdown';

const NavandSideBar = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Toggle sidebar for mobile
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Handle outside click to close sidebar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
        setIsCollapsed(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  // Handle logout
  const handleLogout = () => {
    document.getElementById('logout-form').submit();
    navigate('/login');
  };

  const sidebarItems = [
    { path: '/homepage', icon: <BiGrid />, label: 'Dashboard' },
    { path: '/homepage/profile', icon: <BiUser />, label: 'Profile' },
    { path: '/homepage/wallet', icon: <BiWallet />, label: 'Wallet' },
    {
      path: '#',
      icon: <BiCreditCard />,
      label: 'Scratch Cards',
      subItems: [
        { path: '/homepage/scratch-card/waec-checker', label: 'WAEC Result Checker' },
        { path: '/homepage/scratch-card/neco-checker', label: 'NECO Result Checker' },
        { path: '/homepage/scratch-card/nbais-checker', label: 'NBAIS Result Checker' },
        { path: '/homepage/scratch-card/nabteb-checker', label: 'NABTEB Result Checker' },
      ],
    },
    { path: '/homepage/buy-data', icon: <BiData />, label: 'Buy Data' },
    { path: '/homepage/buy-airtime', icon: <BiPhone />, label: 'Airtime' },
    {
      path: '#',
      icon: <BiBook />,
      label: 'JAMB Services',
      subItems: [
        { path: '/homepage/buy-olevel-upload', label: "O'level Upload" },
        { path: '/homepage/buy-admission-letter', label: 'Admission Letter' },
        { path: '/homepage/buy-original-result', label: 'Original Result' },
        { path: '/homepage/buy-pin-vending', label: 'PIN Vending' },
        { path: '/homepage/reprinting-jamb-caps', label: 'Reprinting & JAMB CAPS' },
      ],
    },
    { path: '/homepage/transactions', icon: <BiListCheck />, label: 'Transactions' },
    { path: '/homepage/support', icon: <BiSupport />, label: 'Support' },
    { path: '/login', icon: <BiLogOut />, label: 'Logout', onClick: handleLogout },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-nunito">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-700 hover:text-primary-color focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <BiMenu className="h-6 w-6" />
          </button>
          <Link to="/homepage" className="flex items-center gap-2">
            <img
              src="https://arewagate.com/images/general/favicon2.png"
              alt="ArewaGate Logo"
              className="h-8 w-8 transition-transform duration-200 hover:scale-105"
            />
            <span className="text-xl font-bold text-text-color hidden md:block">ArewaGate</span>
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Dropdown />
        </nav>
      </header>

      {/* Marquee */}
      <div className="fixed top-14 left-0 right-0 h-6 bg-primary-color text-white z-50 flex items-center justify-center overflow-hidden">
        <p className="text-sm font-medium whitespace-nowrap animate-marquee">
          HAPPY NEW YEAR 2025 - Wishing you a prosperous and joyful year ahead! 🎉✨
        </p>
      </div>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-20 bottom-0 bg-white shadow-lg transition-all duration-300 ease-in-out z-40 ${
          isSidebarOpen || !isCollapsed ? 'w-64' : 'w-16'
        } lg:${isCollapsed ? 'w-16' : 'w-64'}`}
        style={{ maxHeight: 'calc(100vh - 5rem)', overflowY: 'auto' }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <ul className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <div
                className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path || item.subItems?.some((sub) => sub.path === location.pathname)
                    ? 'bg-primary-color text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-color'
                }`}
              >
                <Link
                  to={item.path}
                  className="flex items-center flex-grow"
                  onClick={item.onClick || null}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`ml-3 ${isCollapsed && !isSidebarOpen ? 'hidden' : 'block'} text-sm font-medium`}>
                    {item.label}
                  </span>
                </Link>
                {item.subItems && (
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`p-1 ${isCollapsed && !isSidebarOpen ? 'hidden' : 'block'} hover:bg-gray-200 rounded-full`}
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
                <ul className={`pl-8 mt-1 space-y-1 ${isCollapsed && !isSidebarOpen ? 'hidden' : 'block'} animate-fade-in-up`}>
                  {item.subItems.map((subItem) => (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        className={`block p-2 rounded-lg text-sm transition-all duration-200 ${
                          location.pathname === subItem.path
                            ? 'bg-green-100 text-primary-color font-semibold'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-primary-color'
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

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ease-in-out pt-24 ${
          isSidebarOpen || !isCollapsed ? 'lg:ml-64 ml-0' : 'lg:ml-16 ml-0'
        }`}
      >
        {children}
      </main>

      {/* Logout Form */}
      <form id="logout-form" action="https://arewagate.com/logout" method="POST" className="hidden">
        <input
          type="hidden"
          name="_token"
          value="br4aLlNWcHccu11pONPbyv5whH7qcJj4zrfsBMMG"
          autoComplete="off"
        />
      </form>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default NavandSideBar;