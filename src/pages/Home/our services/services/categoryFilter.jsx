import React from "react";

const CategoryFilter = ({ categories, activeFilter, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onFilterChange(category)}
          className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === category
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;