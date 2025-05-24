// src/components/NavandSideBar.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTransactions } from "../contexts/TransactionContext";
import { useAuth } from "../contexts/AuthContext";
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

const NavandSideBar = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const { logout } = useAuth();
  const { walletBalance } = useTransactions();

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
        { path: "/dashboard/olevel-entry", label: "O-Level Entry" },
        { path: "/dashboard/buy-admission-letter", label: "Admission Letter" },
        { path: "/dashboard/buy-original-result", label: "Original Result" },
        { path: "/dashboard/buy-pin-vending", label: "JAMB Pin Vending" },
        { path: "/dashboard/reprinting-jamb-caps", label: "CAPS Printing" },
      ],
    },
    { path: "/dashboard/ai-examiner", icon: <AiOutlineRobot />, label: "AI Examiner" },
    { path: "/dashboard/transactions", icon: <BiListCheck />, label: "Transactions" },
    { path: "/dashboard/support", icon: <BiSupport />, label: "Support" },
    { path: "/login", icon: <BiLogOut />, label: "Logout", onClick: handleLogout },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-nunito">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-700 hover:text-green-500 focus:outline-none"
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
            <span className="text-xl font-bold text-gray-800 hidden md:block">ArewaGate</span>
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              <span className="text-gray-500">Balance:</span>
              <span className="ml-2 text-green-500">₦{(walletBalance || 0).toLocaleString()}</span>
            </div>
          </div>
        </nav>
      </header>

      <aside
        ref={sidebarRef}
        className={`fixed top-16 bottom-0 bg-white shadow-lg transition-all duration-300 ease-in-out z-40 ${
          isSidebarOpen || !isCollapsed ? "w-64" : "w-16"
        } lg:${isCollapsed ? "w-16" : "w-64"}`}
        style={{ maxHeight: "calc(100vh - 4rem)", overflowY: "auto" }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <ul className="p-3 space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.label}>
              <div
                className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path || item.subItems?.some((sub) => sub.path === location.pathname)
                    ? "bg-green-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-green-500"
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
                <ul className={`pl-8 mt-1 space-y-1 ${isCollapsed && !isSidebarOpen ? "hidden" : "block"}`}>
                  {item.subItems.map((subItem) => (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        className={`block p-2 rounded-lg text-sm transition-all duration-200 ${
                          location.pathname === subItem.path
                            ? "bg-green-100 text-green-500 font-semibold"
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
        className={`transition-all duration-300 ease-in-out pt-16 flex-grow ${
          isSidebarOpen || !isCollapsed ? "lg:ml-64 ml-0" : "lg:ml-16 ml-0"
        }`}
      >
        {children}
      </main>

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
