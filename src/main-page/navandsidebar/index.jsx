import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "react-icons/bi";

import Dropdown from "../dropdown";

const NavandSideBar = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest(".dropdown")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsCollapsed(true);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Toggle dropdown
  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  // Define sidebar items
  const sidebarItems = [
    {
      path: "/homepage",
      icon: <BiGrid className="text-xl" />,
      label: "Dashboard",
    },
    {
      path: "/homepage/profile",
      icon: <BiUser className="text-xl" />,
      label: "Profile",
    },
    {
      path: "/homepage/wallet",
      icon: <BiWallet className="text-xl" />,
      label: "Wallet",
    },
    {
      path: "#",
      icon: <BiCreditCard className="text-xl" />,
      label: "Scratch Cards",
      subItems: [
        { path: "/homepage/scratch-card/waec-checker", label: "WAEC Result Checker" },
        { path: "/scratch-card/history", label: "NECO Result Checker" },
        { path: "/scratch-card/history", label: "NBAIS Result Checker" },
        { path: "/scratch-card/history", label: "NABTEB Result Checker" },
      ],
    },
    {
      path: "/homepage/buy-data",
      icon: <BiData className="text-xl" />,
      label: "Buy Data",
    },
    {
      path: "/homepage/buy-airtime",
      icon: <BiPhone className="text-xl" />,
      label: "Airtime",
    },
    {
      path: "#",
      icon: <BiBook className="text-xl" />,
      label: "JAMB Services",
      subItems: [
        { path: "/homepage/buy-olevel-upload", label: "O'level Upload" },
        { path: "/homepage/buy-admission-letter", label: "Admission Letter" },
        { path: "/homepage/buy-original-result", label: "Original Result" },
        { path: "/homepage/buy-pin-vending", label: "PIN Vending" },
        { path: "/homepage/reprinting-jamb-caps", label: "Reprinting & JAMB CAPS" },
      ],
    },
    {
      path: "/homepage/transactions",
      icon: <BiListCheck className="text-xl" />,
      label: "Transactions",
    },
    {
      path: "/homepage/support",
      icon: <BiSupport className="text-xl" />,
      label: "Support",
    },
    {
      path: "/login",
      icon: <BiLogOut className="text-xl" />,
      label: "Logout",
    },
  ];

  return (
    <div className="bg-gray-100">
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md flex items-center justify-between p-4 z-50">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/homepage" className="flex items-center">
            <img
              src="https://arewagate.com/images/general/favicon2.png"
              alt="Logo"
              className="h-8 w-8"
            />
            <span className="hidden lg:block ml-2 text-xl font-bold">
              ArewaGate
            </span>
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="flex items-center space-x-6">
          {/* Profile Dropdown */}
          <Dropdown />
        </nav>
      </header>

      {/* Logout Form */}
      <form
        id="logout-form"
        action="https://arewagate.com/logout"
        method="POST"
        className="d-none"
      >
        <input
          type="hidden"
          name="_token"
          value="br4aLlNWcHccu11pONPbyv5whH7qcJj4zrfsBMMG"
          autoComplete="off"
        />
      </form>

      <div className="fixed top-16 left-0 right-0 h-5 flex items-center justify-center overflow-hidden bg-gradient-to-r from-green-500 to-green-600 z-50 marquee">
        <p className="text-white text-sm font-medium whitespace-nowrap animate-marquee">
          HAPPY NEW YEAR 2025 - Wishing you a prosperous and joyful year ahead!
          🎉✨
        </p>
      </div>

      <div className="">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`fixed top-20 left-0 bottom-0 bg-white shadow-md p-4 transition-all duration-300 ease-in-out ${
            isCollapsed ? "w-20" : "w-64"
          }`}
          style={{
            zIndex: 1000, // Ensure sidebar is above other content
            maxHeight: "calc(100vh - 5rem)", // Adjust height to fit viewport
            overflowY: "auto", // Enable vertical scrolling
            overflowX: "hidden", // Disable horizontal scrolling
          }}
          onMouseEnter={() => setIsCollapsed(false)}
          onMouseLeave={() => setIsCollapsed(true)}
        >
          {/* Sidebar Items */}
          <ul>
            {sidebarItems.map((item) => (
              <li key={item.path} className="mb-2">
                <div
                  className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "bg-green-500 text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-green-500"
                  }`}
                >
                  <Link to={item.path} className="flex items-center flex-grow">
                    {item.icon}
                    <span className={`ml-2 ${isCollapsed ? "hidden" : "block"}`}>
                      {item.label}
                    </span>
                  </Link>
                  {item.subItems && (
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
                    >
                      {openDropdown === item.label ? (
                        <BiChevronUp className="text-xl" />
                      ) : (
                        <BiChevronDown className="text-xl" />
                      )}
                    </button>
                  )}
                </div>

                {/* Dropdown Items */}
                {item.subItems && openDropdown === item.label && (
                  <ul
                    className={`pl-6 mt-2 space-y-1 transition-all duration-300 ease-in-out ${
                      isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto"
                    }`}
                  >
                    {item.subItems.map((subItem) => (
                      <li key={subItem.path}>
                        <Link
                          to={subItem.path}
                          className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                            location.pathname === subItem.path
                              ? "bg-green-500 text-white"
                              : "text-gray-700 hover:bg-gray-100 hover:text-green-500"
                          }`}
                        >
                          <span className="ml-2">{subItem.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main
          className={`transition-all duration-300 ease-in-out ${
            isCollapsed ? "ml-20" : "ml-64"
          }`}
          style={{
            marginLeft: isCollapsed ? "5rem" : "16rem", // Adjust margin for mobile
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default NavandSideBar;