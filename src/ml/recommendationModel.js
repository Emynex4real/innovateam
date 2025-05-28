import { useState, useEffect } from 'react';

// Utility function to calculate similarity between two users
const calculateSimilarity = (user1Ratings, user2Ratings) => {
  const commonServices = Object.keys(user1Ratings).filter(
    service => service in user2Ratings
  );

  if (commonServices.length === 0) return 0;

  const sum1 = commonServices.reduce((acc, service) => acc + user1Ratings[service], 0);
  const sum2 = commonServices.reduce((acc, service) => acc + user2Ratings[service], 0);
  
  const avg1 = sum1 / commonServices.length;
  const avg2 = sum2 / commonServices.length;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  commonServices.forEach(service => {
    const rating1 = user1Ratings[service] - avg1;
    const rating2 = user2Ratings[service] - avg2;
    
    numerator += rating1 * rating2;
    denominator1 += rating1 * rating1;
    denominator2 += rating2 * rating2;
  });

  if (denominator1 === 0 || denominator2 === 0) return 0;
  
  return numerator / Math.sqrt(denominator1 * denominator2);
};

// Main recommendation model class
export class RecommendationModel {
  constructor() {
    this.userRatings = {};
    this.serviceRatings = {};
    this.userHistory = {};
  }

  // Add a user interaction with a service
  addInteraction(userId, serviceId, rating, timestamp = Date.now()) {
    if (!this.userRatings[userId]) {
      this.userRatings[userId] = {};
    }
    
    if (!this.serviceRatings[serviceId]) {
      this.serviceRatings[serviceId] = {};
    }

    if (!this.userHistory[userId]) {
      this.userHistory[userId] = [];
    }

    this.userRatings[userId][serviceId] = rating;
    this.serviceRatings[serviceId][userId] = rating;
    this.userHistory[userId].push({ serviceId, rating, timestamp });
  }

  // Get recommendations for a user
  getRecommendations(userId, numRecommendations = 5) {
    if (!this.userRatings[userId]) {
      return [];
    }

    const similarities = {};
    const userRatings = this.userRatings[userId];

    // Calculate similarities with other users
    Object.keys(this.userRatings).forEach(otherId => {
      if (otherId !== userId) {
        similarities[otherId] = calculateSimilarity(
          userRatings,
          this.userRatings[otherId]
        );
      }
    });

    // Get all services not yet rated by the user
    const unratedServices = new Set(
      Object.keys(this.serviceRatings).filter(
        serviceId => !(serviceId in userRatings)
      )
    );

    // Calculate predicted ratings
    const predictions = Array.from(unratedServices).map(serviceId => {
      let weightedSum = 0;
      let similaritySum = 0;

      Object.keys(similarities).forEach(otherId => {
        if (serviceId in this.userRatings[otherId]) {
          const similarity = similarities[otherId];
          weightedSum += similarity * this.userRatings[otherId][serviceId];
          similaritySum += Math.abs(similarity);
        }
      });

      const predictedRating = similaritySum > 0 ? weightedSum / similaritySum : 0;

      return {
        serviceId,
        rating: predictedRating
      };
    });

    // Sort and return top recommendations
    return predictions
      .sort((a, b) => b.rating - a.rating)
      .slice(0, numRecommendations)
      .map(pred => pred.serviceId);
  }

  // Get user's service history
  getUserHistory(userId) {
    return this.userHistory[userId] || [];
  }

  // Get popular services based on average ratings
  getPopularServices(numServices = 5) {
    const averageRatings = Object.keys(this.serviceRatings).map(serviceId => {
      const ratings = Object.values(this.serviceRatings[serviceId]);
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      return { serviceId, rating: average };
    });

    return averageRatings
      .sort((a, b) => b.rating - a.rating)
      .slice(0, numServices)
      .map(item => item.serviceId);
  }
}

// React hook for using the recommendation model
export const useRecommendations = (userId) => {
  const [model] = useState(() => new RecommendationModel());
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // In a real application, you would load historical data here
        // For demo purposes, let's add some sample interactions
        model.addInteraction('user1', 'waec-checker', 5);
        model.addInteraction('user1', 'neco-checker', 4);
        model.addInteraction('user2', 'waec-checker', 4);
        model.addInteraction('user2', 'nabteb-checker', 5);
        model.addInteraction(userId, 'waec-checker', 5);

        const userRecommendations = model.getRecommendations(userId);
        setRecommendations(userRecommendations);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, model]);

  const addUserInteraction = (serviceId, rating) => {
    model.addInteraction(userId, serviceId, rating);
    setRecommendations(model.getRecommendations(userId));
  };

  return {
    recommendations,
    loading,
    addUserInteraction
  };
}; 