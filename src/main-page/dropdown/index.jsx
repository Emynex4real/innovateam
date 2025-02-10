import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BiUser, BiLogOut, BiChevronDown, BiChevronUp } from "react-icons/bi";

const Dropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

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

  // Handle logout
  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
  };

  return (
    <div className="relative dropdown">
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center focus:outline-none"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
          
        </div>
        <span className="hidden md:block ml-2 text-green-500">
          Michael Balogun Temidayo
        </span>
        {/* Dropdown Icon */}
        {isDropdownOpen ? (
          <BiChevronUp className="ml-2 text-green-500" />
        ) : (
          <BiChevronDown className="ml-2 text-green-500" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-10 w-56 bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out transform opacity-100 translate-y-0">
          <div className="p-4 border-b">
            <h6 className="font-bold">Michael Balogun Temidayo</h6>
            <span className="text-sm text-gray-600">
              michaelbalogun34@gmail.com
            </span>
          </div>
          <ul className="py-2">
            <li>
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <BiUser className="mr-2" />
                My Profile
              </Link>
            </li>
            <li>
              <Link to={'/login'}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <BiLogOut className="mr-2" />
                  Sign Out
                </button>
              
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;