import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BiUser,
  BiLogOut,
  BiChevronDown,
  BiChevronUp,
  BiCog,
} from "react-icons/bi";
import { motion } from "framer-motion";

const Dropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Simulate logout logic
    console.log("User logged out");
    document.getElementById("logout-form")?.submit(); // If logout form exists
    navigate("/login");
  };

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative dropdown" ref={dropdownRef}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-color rounded-full p-1 transition-all duration-200"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <div className="w-10 h-10 bg-primary-color rounded-full flex items-center justify-center text-white text-lg font-medium">
          {getInitials("Michael Balogun Temidayo")}
        </div>
        <span className="hidden md:block text-sm font-medium text-text-color truncate max-w-[150px]">
          Michael Balogun Temidayo
        </span>
        {isDropdownOpen ? (
          <BiChevronUp className="text-primary-color" />
        ) : (
          <BiChevronDown className="text-primary-color" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
        >
          
          <div className="p-4 border-b border-gray-200">
            <h6 className="text-sm font-semibold text-text-color truncate">
              Michael Balogun Temidayo
            </h6>
            <span className="text-xs text-gray-500 truncate block">
              michaelbalogun34@gmail.com
            </span>
          </div>
          <ul className="py-2">
            <li>
              <Link
                to="/homepage/profile"
                className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
                  location.pathname === "/homepage/profile"
                    ? "bg-gray-100 font-semibold"
                    : ""
                }`}
                onClick={() => setIsDropdownOpen(false)}
              >
                <BiUser className="mr-2 text-primary-color" />
                My Profile
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <BiLogOut className="mr-2 text-primary-color" />
                Sign Out
              </button>
            </li>
            <li>
              <Link
                to="/homepage/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <BiCog className="mr-2 text-primary-color" />
                Settings
              </Link>
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
};

// Helper function to get initials
const getInitials = (name) => {
  const names = name.split(" ");
  return names.length > 1
    ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    : names[0][0].toUpperCase();
};

export default Dropdown;
