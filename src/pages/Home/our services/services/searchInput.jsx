import React from "react";
import { Search } from "lucide-react";

const SearchInput = ({ searchTerm, setSearchTerm, isDarkMode }) => {
  return (
    <div className="relative max-w-md w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className={`h-5 w-5 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'}`} />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`block w-full pl-10 pr-4 py-2.5 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-edu-primary/50
                 ${
                   isDarkMode 
                     ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder:text-dark-text-secondary' 
                     : 'bg-white border border-gray-300 text-gray-700 placeholder:text-gray-400'
                 }`}
        placeholder="Search for services..."
      />
    </div>
  );
};

export default SearchInput;
