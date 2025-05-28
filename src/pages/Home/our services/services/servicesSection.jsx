import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Info } from "lucide-react";
import CategoryFilter from './categoryFilter';
import SearchInput from './searchInput';
import ServiceCard from './serviceCard';

const ServicesSection = ({ services, isAuthenticated, isDarkMode }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedServices, setDisplayedServices] = useState(services);

  // Get unique categories for the filter
  const categories = ["All", ...Array.from(new Set(services.map((service) => service.category)))];

  // Apply filters when filter or search term changes
  useEffect(() => {
    let filtered = services;

    // Apply category filter
    if (filter !== "All") {
      filtered = filtered.filter((service) => service.category === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(search) ||
          service.category.toLowerCase().includes(search)
      );
    }

    setDisplayedServices(filtered);
  }, [filter, searchTerm, services]);

  const handleProceed = (title) => {
    if (isAuthenticated) {
      alert(`Proceeding with service: You selected: ${title}`);
      navigate("/homepage", { state: { service: title } });
    } else {
      alert("Authentication required: Please log in to continue");
      navigate("/login", { state: { service: title } });
    }
  };

  return (
    <section className={`py-12 sm:py-16 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-4xl mx-auto text-center mb-10 sm:mb-14`}>
          <span className={`inline-block mb-3 px-3 py-1 ${
            isDarkMode 
              ? 'bg-green-900/30 text-green-400 border border-green-800' 
              : 'bg-green-100 text-green-600'
          } font-medium rounded-full`}>
            Our Services
          </span>

          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 flex items-center justify-center gap-3 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
          }`}>
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            Educational Services Marketplace
          </h2>

          <p className={`text-base sm:text-lg mb-6 sm:mb-8 ${
            isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
          }`}>
            Access exam scratch cards, verification services, and educational resources all in one place
          </p>

          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 justify-center items-center">
            <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} isDarkMode={isDarkMode} />
            <CategoryFilter
              categories={categories}
              activeFilter={filter}
              onFilterChange={setFilter}
              isDarkMode={isDarkMode}
            />
          </div>
        </div>

        {displayedServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {displayedServices.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                title={service.title}
                image={service.image}
                price={service.price}
                category={service.category}
                onProceed={handleProceed}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center py-12 sm:py-16 ${
            isDarkMode 
              ? 'bg-dark-surface border border-dark-border' 
              : 'bg-white border border-gray-200'
          } rounded-xl shadow-sm`}>
            <Info className={`h-10 w-10 sm:h-12 sm:w-12 ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'
            } mb-4`} />
            <h3 className={`text-lg sm:text-xl font-medium mb-2 ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>No services found</h3>
            <p className={`text-sm sm:text-base mb-4 sm:mb-6 ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
            }`}>
              We couldn't find any services matching your search criteria
            </p>
            <button
              onClick={() => {
                setFilter("All");
                setSearchTerm("");
              }}
              className={`px-4 py-2 ${
                isDarkMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white rounded-lg transition-colors`}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;