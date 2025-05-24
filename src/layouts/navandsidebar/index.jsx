import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTransactions } from "../../contexts/TransactionContext";
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
} from "react-icons/bi";
import { AiOutlineRobot } from "react-icons/ai";
import { useAuth } from "../../contexts/AuthContext"; // Fixed import path
// import Dropdown from "./../../pages/dropdown/index"; // Removed until confirmed

const NavandSideBar = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const { logout } = useAuth();
  const { getWalletBalance } = useTransactions();
  const walletBalance = getWalletBalance();
  
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
        setIsCollapsed(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
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
      ],
    },
    { path: "/dashboard/buy-data", icon: <BiData />, label: "Buy Data" },
    { path: "/dashboard/buy-airtime", icon: <BiPhone />, label: "Airtime" },
    {
      path: "#",
      icon: <BiBook />,
      label: "JAMB Services",
      subItems: [
        { path: "/dashboard/buy-olevel-upload", label: "O'level Upload" },
        { path: "/dashboard/buy-admission-letter", label: "Admission Letter" },
        { path: "/dashboard/buy-original-result", label: "Original Result" },
        { path: "/dashboard/buy-pin-vending", label: "PIN Vending" },
        { path: "/dashboard/reprinting-jamb-caps", label: "Reprinting & JAMB CAPS" },
      ],
    },
    { path: "/dashboard/ai-examiner", icon: <AiOutlineRobot />, label: "AI Examiner" },
    { path: "/dashboard/transactions", icon: <BiListCheck />, label: "Transactions" },
    { path: "/dashboard/support", icon: <BiSupport />, label: "Support" },
    { path: "/login", icon: <BiLogOut />, label: "Logout", onClick: handleLogout },
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-nunito">
      
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
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://arewagate.com/images/general/favicon2.png"
              alt="ArewaGate Logo"
              className="h-8 w-8 transition-transform duration-200 hover:scale-105"
            />
            <span className="text-xl font-bold text-text-color hidden md:block">ArewaGate</span>
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              <span className="text-gray-500">Balance:</span>
              <span className="ml-2 text-primary-color">₦{walletBalance.toLocaleString()}</span>
            </div>
          </div>
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
          isSidebarOpen || !isCollapsed ? "w-64" : "w-16"
        } lg:${isCollapsed ? "w-16" : "w-64"}`}
        style={{ maxHeight: "calc(100vh - 5rem)", overflowY: "auto" }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <ul className="p-3 space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <div
                className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path || item.subItems?.some((sub) => sub.path === location.pathname)
                    ? "bg-primary-color text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary-color"
                }`}
              >
                <Link
                  to={item.path}
                  className="flex items-center flex-grow"
                  onClick={item.onClick || null}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className={`ml-3 ${isCollapsed && !isSidebarOpen ? "hidden" : "block"} text-sm font-medium`}>
                    {item.label}
                  </span>
                </Link>
                {item.subItems && (
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`p-1 ${isCollapsed && !isSidebarOpen ? "hidden" : "block"} hover:bg-gray-200 rounded-full`}
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
                <ul className={`pl-8 mt-1 space-y-1 ${isCollapsed && !isSidebarOpen ? "hidden" : "block"} animate-fade-in-up`}>
                  {item.subItems.map((subItem) => (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        className={`block p-2 rounded-lg text-sm transition-all duration-200 ${
                          location.pathname === subItem.path
                            ? "bg-green-100 text-primary-color font-semibold"
                            : "text-gray-600 hover:bg-gray-100 hover:text-primary-color"
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
        className={`transition-all duration-300 ease-in-out pt-24 flex-grow ${
          isSidebarOpen || !isCollapsed ? "lg:ml-64 ml-0" : "lg:ml-16 ml-0"
        }`}
      >
        {children}
      </main>

      {/* Footer */}
      <footer
        className={`bg-white text-black py-2 transition-all duration-300 ease-in-out border-t border-gray-100 shadow-md ${
          isSidebarOpen || !isCollapsed ? "lg:ml-64 ml-0" : "lg:ml-16 ml-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img
              src="https://arewagate.com/images/general/favicon2.png"
              alt="ArewaGate Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold">ArewaGate</span>
          </div>
          <div className="text-gray-800 text-sm text-center md:text-right">
            <p>© {new Date().getFullYear()} ArewaGate. All rights reserved.</p>
            <p className="mt-2">
              <Link to="/support" className="text-gray-800 hover:text-green-400 transition-colors">
                Support
              </Link>{" "}
              |{" "}
              <Link to="/about" className="text-gray-800 hover:text-green-400 transition-colors ml-2">
                About Us
              </Link>{" "}
              |{" "}
              <Link to="/blogs" className="text-gray-800 hover:text-green-400 transition-colors ml-2">
                Blogs
              </Link>
            </p>
          </div>
        </div>
      </footer>

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