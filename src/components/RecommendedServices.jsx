import React from 'react';
import { useRecommendations } from '../ml/recommendationModel';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Star } from 'lucide-react';

const RecommendedServices = ({ userId, services }) => {
  const { isDarkMode } = useDarkMode();
  const { recommendations, loading, addUserInteraction } = useRecommendations(userId);

  const recommendedServices = recommendations
    .map(serviceId => services.find(s => s.id === serviceId))
    .filter(Boolean);

  if (loading) {
    return (
      <div className={`p-4 rounded-lg ${
        isDarkMode ? 'bg-dark-surface text-dark-text-secondary' : 'bg-white text-gray-600'
      }`}>
        <p className="text-center">Loading recommendations...</p>
      </div>
    );
  }

  if (recommendedServices.length === 0) {
    return (
      <div className={`p-6 rounded-lg ${
        isDarkMode ? 'bg-dark-surface text-dark-text-secondary' : 'bg-white text-gray-600'
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${
          isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
        }`}>
          Recommended Services
        </h3>
        <p>No recommendations available yet. Try using more services!</p>
      </div>
    );
  }

  const handleServiceRating = (serviceId, rating) => {
    addUserInteraction(serviceId, rating);
  };

  return (
    <div className={`p-6 rounded-lg ${
      isDarkMode ? 'bg-dark-surface' : 'bg-white'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
      }`}>
        Recommended for You
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendedServices.map((service) => (
          <div
            key={service.id}
            className={`p-4 rounded-lg transition-all hover:scale-105 ${
              isDarkMode 
                ? 'bg-dark-bg border border-dark-border' 
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <h4 className={`font-medium mb-2 ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>
              {service.title}
            </h4>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
              }`}>
                ₦{service.price.toLocaleString()}
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleServiceRating(service.id, rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        rating <= (service.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : isDarkMode
                            ? 'text-dark-text-secondary'
                            : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedServices; 