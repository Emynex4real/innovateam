import axios from 'axios';
import { coursePredictor } from '../utils/coursePredictor';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class CourseRecommendationService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Predict courses using local ML algorithm (primary method)
  async predictCourses(studentData) {
    try {
      // Validate input data
      const validation = coursePredictor.validateStudentData(studentData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Use local ML predictor
      const prediction = coursePredictor.predictCourses(studentData);
      
      // Log prediction for analytics (optional)
      this.logPrediction(studentData, prediction).catch(console.warn);
      
      return {
        success: true,
        data: prediction,
        source: 'local_ml',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Local prediction failed:', error);
      
      // Fallback to server prediction if available
      try {
        return await this.predictCoursesServer(studentData);
      } catch (serverError) {
        console.error('Server prediction also failed:', serverError);
        throw new Error('Course prediction service unavailable');
      }
    }
  }

  // Server-based prediction (fallback)
  async predictCoursesServer(studentData) {
    try {
      const response = await this.apiClient.post('/course-recommendation/predict', {
        student_data: studentData,
        include_details: true,
        max_predictions: 15
      });

      return {
        success: true,
        data: response.data,
        source: 'server',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Server prediction error:', error);
      throw new Error(
        error.response?.data?.message || 
        'Failed to get course predictions from server'
      );
    }
  }

  // Get detailed course information
  async getCourseDetails(courseName) {
    try {
      // First try local data
      const localDetails = coursePredictor.getCourseDetails(courseName);
      if (localDetails) {
        return {
          success: true,
          data: localDetails,
          source: 'local'
        };
      }

      // Fallback to server
      const response = await this.apiClient.get(`/courses/${encodeURIComponent(courseName)}`);
      return {
        success: true,
        data: response.data,
        source: 'server'
      };
    } catch (error) {
      console.error('Failed to get course details:', error);
      throw new Error('Course details not available');
    }
  }

  // Get all available courses
  async getAllCourses() {
    try {
      // Use local data first
      const localCourses = coursePredictor.getAllCourses();
      return {
        success: true,
        data: localCourses.map(name => ({
          name,
          details: coursePredictor.getCourseDetails(name)
        })),
        source: 'local'
      };
    } catch (error) {
      console.error('Failed to get courses:', error);
      throw new Error('Course list not available');
    }
  }

  // Save prediction history
  async savePredictionHistory(studentData, prediction) {
    try {
      const response = await this.apiClient.post('/course-recommendation/history', {
        student_data: studentData,
        prediction_result: prediction,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Failed to save prediction history:', error);
      // Don't throw error as this is not critical
      return { success: false, error: error.message };
    }
  }

  // Get prediction history for user
  async getPredictionHistory(userId) {
    try {
      const response = await this.apiClient.get(`/course-recommendation/history/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to get prediction history:', error);
      return { success: false, data: [], error: error.message };
    }
  }

  // Get course statistics and trends
  async getCourseStatistics() {
    try {
      const response = await this.apiClient.get('/course-recommendation/statistics');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Failed to get course statistics:', error);
      return { 
        success: false, 
        data: {
          total_predictions: 0,
          popular_courses: [],
          success_rate: 0
        }
      };
    }
  }

  // Validate student data
  validateStudentData(studentData) {
    return coursePredictor.validateStudentData(studentData);
  }

  // Get course requirements
  getCourseRequirements(courseName) {
    const courseDetails = coursePredictor.getCourseDetails(courseName);
    return courseDetails ? courseDetails.requirements : null;
  }

  // Compare multiple courses
  async compareCourses(courseNames) {
    try {
      const comparisons = courseNames.map(name => {
        const details = coursePredictor.getCourseDetails(name);
        return {
          name,
          details,
          available: !!details
        };
      });

      return {
        success: true,
        data: comparisons
      };
    } catch (error) {
      console.error('Failed to compare courses:', error);
      throw new Error('Course comparison failed');
    }
  }

  // Get admission trends
  async getAdmissionTrends(courseName, years = 3) {
    try {
      const response = await this.apiClient.get(`/course-recommendation/trends/${encodeURIComponent(courseName)}`, {
        params: { years }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Failed to get admission trends:', error);
      return {
        success: false,
        data: {
          cutoff_trends: [],
          competition_trends: [],
          capacity_trends: []
        }
      };
    }
  }

  // Log prediction for analytics (non-blocking)
  async logPrediction(studentData, prediction) {
    try {
      await this.apiClient.post('/analytics/prediction-log', {
        student_profile: {
          utme_score: studentData.utmeScore,
          olevel_count: Object.keys(studentData.olevelSubjects || {}).length,
          interests_count: (studentData.interests || []).length,
          learning_style: studentData.learningStyle,
          state: studentData.stateOfOrigin
        },
        prediction_summary: {
          top_course: prediction.top_prediction?.course,
          top_score: prediction.top_prediction?.probability,
          total_eligible: prediction.total_eligible,
          avg_score: prediction.statistics?.average_score
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the main flow
      console.debug('Analytics logging failed:', error.message);
    }
  }

  // Export prediction results
  async exportPrediction(prediction, format = 'json') {
    try {
      const exportData = {
        prediction_summary: {
          top_recommendation: prediction.top_prediction,
          all_predictions: prediction.predictions,
          statistics: prediction.statistics,
          generated_at: new Date().toISOString()
        }
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
        return URL.createObjectURL(blob);
      } else if (format === 'csv') {
        const csvContent = this.convertToCSV(prediction.predictions);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        return URL.createObjectURL(blob);
      }

      throw new Error('Unsupported export format');
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export prediction results');
    }
  }

  // Helper method to convert predictions to CSV
  convertToCSV(predictions) {
    const headers = ['Course', 'Probability (%)', 'Faculty', 'Cutoff', 'Capacity', 'Career Prospects'];
    const rows = predictions.map(p => [
      p.course,
      p.probability,
      p.details.faculty,
      p.details.cutoff,
      p.details.capacity,
      (p.details.career_prospects || []).join('; ')
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Get personalized recommendations based on user history
  async getPersonalizedRecommendations(userId) {
    try {
      const response = await this.apiClient.get(`/course-recommendation/personalized/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.warn('Failed to get personalized recommendations:', error);
      return {
        success: false,
        data: {
          recommended_courses: [],
          trending_courses: [],
          similar_profiles: []
        }
      };
    }
  }
}

// Export singleton instance
export const courseRecommendationService = new CourseRecommendationService();
export default courseRecommendationService;