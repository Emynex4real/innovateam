import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { coursePredictor, FUTA_COURSES } from '../../../utils/coursePredictor';
import courseRecommendationService from '../../../services/courseRecommendation.service';
import {
  AcademicCapIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserIcon,
  MapPinIcon,
  BeakerIcon,
  CalculatorIcon,
  GlobeAltIcon,
  BookOpenIcon,
  LightBulbIcon,
  CogIcon,
  BuildingOfficeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const CourseRecommender = () => {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    utmeScore: '',
    preferredCourse: '',
    utmeSubjects: ['English Language'],
    interests: [],
    learningStyle: '',
    stateOfOrigin: '',
    gender: '',
    olevelSubjects: {}
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  const [exportLoading, setExportLoading] = useState(false);

  // Constants
  const courseNames = Object.keys(FUTA_COURSES);

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
    "Yobe", "Zamfara"
  ];

  const learningStyles = ["Analytical Thinker", "Visual Learner", "Practical Learner", "Conceptual Learner", "Social Learner"];

  const interestOptions = [
    "Technology & Innovation", "Engineering & Design", "Environmental Sciences", 
    "Business & Management", "Health Sciences", "Agriculture & Food Security"
  ];

  const utmeSubjectOptions = [
    "English Language", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", 
    "Geography", "Agricultural Science", "Fine Art", "Government", "Literature in English"
  ];

  const olevelSubjects = [
    "English Language", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", 
    "Geography", "Agricultural Science", "Technical Drawing", "Further Mathematics", 
    "Government", "Literature in English", "Fine Art"
  ];

  const gradeOptions = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];





  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectChange = (subject, checked) => {
    if (subject === 'English Language') return; // Always required
    
    setFormData(prev => ({
      ...prev,
      utmeSubjects: checked 
        ? [...prev.utmeSubjects, subject]
        : prev.utmeSubjects.filter(s => s !== subject)
    }));
  };

  const handleOlevelGrade = (subject, grade) => {
    setFormData(prev => ({
      ...prev,
      olevelSubjects: {
        ...prev.olevelSubjects,
        [subject]: grade
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate using the service
    const validation = courseRecommendationService.validateStudentData(formData);
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    
    try {
      // Use the comprehensive service for prediction
      const result = await courseRecommendationService.predictCourses(formData);
      
      if (result.success) {
        setPrediction(result.data);
        
        // Save to history (non-blocking)
        courseRecommendationService.savePredictionHistory(formData, result.data)
          .catch(err => console.warn('Failed to save history:', err));
        
        if (result.data.top_prediction) {
          toast.success(
            `Prediction complete! Top recommendation: ${result.data.top_prediction.course} (${result.data.top_prediction.probability}% match)`,
            { duration: 5000 }
          );
        } else {
          toast.warning('No eligible courses found. Consider improving your qualifications.');
        }
      } else {
        throw new Error('Prediction service returned unsuccessful result');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error(`Prediction failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      utmeScore: '',
      preferredCourse: '',
      utmeSubjects: ['English Language'],
      interests: [],
      learningStyle: '',
      stateOfOrigin: '',
      gender: '',
      olevelSubjects: {}
    });
    setPrediction(null);
  };

  const handleExport = async (format = 'json') => {
    if (!prediction) {
      toast.error('No prediction data to export');
      return;
    }

    setExportLoading(true);
    try {
      const downloadUrl = await courseRecommendationService.exportPrediction(prediction, format);
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `course-prediction-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      URL.revokeObjectURL(downloadUrl);
      
      toast.success(`Prediction exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export prediction data');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
            FUTA Course Recommender
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
            Get personalized course recommendations based on your qualifications and interests
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'individual'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Individual Prediction
            </button>
            <button
              onClick={() => setActiveTab('help')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'help'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Help & FAQ
            </button>
          </div>
        </div>

        {activeTab === 'individual' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className={`rounded-lg shadow-lg p-6 ${
              isDarkMode ? 'bg-dark-surface border border-dark-border' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                Enter Your Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-dark-surface-secondary border-dark-border text-dark-text-primary' 
                          : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      UTME Score (0-400)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="400"
                      value={formData.utmeScore}
                      onChange={(e) => handleInputChange('utmeScore', parseInt(e.target.value) || '')}
                      className={`w-full p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-dark-surface-secondary border-dark-border text-dark-text-primary' 
                          : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      placeholder="Enter your UTME score"
                    />
                  </div>
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      Preferred Course
                    </label>
                    <select
                      value={formData.preferredCourse}
                      onChange={(e) => handleInputChange('preferredCourse', e.target.value)}
                      className={`w-full p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-dark-surface-secondary border-dark-border text-dark-text-primary' 
                          : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    >
                      <option value="">Select preferred course</option>
                      {courseNames.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      State of Origin
                    </label>
                    <select
                      value={formData.stateOfOrigin}
                      onChange={(e) => handleInputChange('stateOfOrigin', e.target.value)}
                      className={`w-full p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-dark-surface-secondary border-dark-border text-dark-text-primary' 
                          : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    >
                      <option value="">Select state</option>
                      {nigerianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className={`w-full p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-dark-surface-secondary border-dark-border text-dark-text-primary' 
                          : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      Learning Style
                    </label>
                    <select
                      value={formData.learningStyle}
                      onChange={(e) => handleInputChange('learningStyle', e.target.value)}
                      className={`w-full p-3 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-dark-surface-secondary border-dark-border text-dark-text-primary' 
                          : 'bg-white border-gray-300'
                      } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    >
                      <option value="">Select learning style</option>
                      {learningStyles.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* UTME Subjects */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                    UTME Subjects (Select exactly 4, including English Language)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {utmeSubjectOptions.map(subject => (
                      <label key={subject} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.utmeSubjects.includes(subject)}
                          onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                          disabled={subject === 'English Language' || (formData.utmeSubjects.length >= 4 && !formData.utmeSubjects.includes(subject))}
                          className="rounded text-green-600 focus:ring-green-500"
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                          {subject}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                    Interests (Select up to 3)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {interestOptions.map(interest => (
                      <label key={interest} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={(e) => {
                            if (e.target.checked && formData.interests.length < 3) {
                              handleInputChange('interests', [...formData.interests, interest]);
                            } else if (!e.target.checked) {
                              handleInputChange('interests', formData.interests.filter(i => i !== interest));
                            }
                          }}
                          disabled={formData.interests.length >= 3 && !formData.interests.includes(interest)}
                          className="rounded text-green-600 focus:ring-green-500"
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                          {interest}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* O-Level Subjects */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                    O-Level Subjects and Grades (Select at least 5)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {olevelSubjects.map(subject => (
                      <div key={subject} className="flex items-center space-x-2">
                        <span className={`text-sm flex-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                          {subject}
                        </span>
                        <select
                          value={formData.olevelSubjects[subject] || ''}
                          onChange={(e) => handleOlevelGrade(subject, e.target.value)}
                          className={`p-2 rounded border ${
                            isDarkMode 
                              ? 'bg-dark-surface-secondary border-dark-border text-dark-text-primary' 
                              : 'bg-white border-gray-300'
                          } focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                        >
                          <option value="">Grade</option>
                          {gradeOptions.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <BeakerIcon className="w-5 h-5" />
                        <span>Predict Admission</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Results */}
            <div className={`rounded-lg shadow-lg p-6 ${
              isDarkMode ? 'bg-dark-surface border border-dark-border' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                Prediction Results
              </h2>
              
              {!prediction ? (
                <div className="text-center py-12">
                  <AcademicCapIcon className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                    Fill out the form and click "Predict Admission" to see your results
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Prediction */}
                  {prediction.top_prediction ? (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <TrophyIcon className="w-6 h-6 text-yellow-600" />
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
                          Top Recommendation
                        </h3>
                        <span className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                          {prediction.top_prediction.probability}% Match
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {prediction.top_prediction.course}
                      </p>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                        {prediction.top_prediction.details.faculty}
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>Cutoff:</span>
                          <span className="ml-2">{prediction.top_prediction.details.cutoff}</span>
                        </div>
                        <div>
                          <span className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>Capacity:</span>
                          <span className="ml-2">{prediction.top_prediction.details.capacity}</span>
                        </div>
                      </div>
                      {prediction.top_prediction.details.career_prospects && (
                        <div className="mt-3">
                          <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>Career Prospects:</p>
                          <div className="flex flex-wrap gap-1">
                            {prediction.top_prediction.details.career_prospects.slice(0, 3).map((career, idx) => (
                              <span key={idx} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                                {career}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
                          No Eligible Courses Found
                        </h3>
                      </div>
                      <p className="text-red-700 dark:text-red-300 mb-3">
                        Based on your current qualifications, no courses meet the minimum requirements.
                      </p>
                      {prediction.statistics.recommended_actions.length > 0 && (
                        <div>
                          <p className="font-medium text-red-800 dark:text-red-400 mb-2">Recommended Actions:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                            {prediction.statistics.recommended_actions.map((action, idx) => (
                              <li key={idx}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Statistics */}
                  {prediction.statistics && (
                    <div className={`rounded-lg border p-4 ${
                      isDarkMode ? 'border-dark-border bg-dark-surface-secondary' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                        Prediction Statistics
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">{prediction.statistics.score_distribution.high}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>High Match (70%+)</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">{prediction.statistics.score_distribution.medium}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>Medium Match (40-70%)</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-red-600">{prediction.statistics.score_distribution.low}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>Low Match (&lt;40%)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Predictions */}
                  {prediction.predictions && prediction.predictions.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                        All Eligible Courses ({prediction.total_eligible})
                      </h4>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {prediction.predictions.map((course, index) => (
                          <div key={index} className={`p-4 rounded-lg border ${
                            isDarkMode ? 'border-dark-border bg-dark-surface-secondary' : 'border-gray-200 bg-white'
                          } hover:shadow-md transition-shadow`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h5 className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                                  {course.course}
                                </h5>
                                <p className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                                  {course.details.faculty}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`flex items-center space-x-1 ${
                                  course.probability >= 70 ? 'text-green-600' :
                                  course.probability >= 40 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  <StarIcon className="w-4 h-4" />
                                  <span className="font-bold">{course.probability}%</span>
                                </div>
                                <p className={`text-xs ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                                  Cutoff: {course.details.cutoff}
                                </p>
                              </div>
                            </div>
                            {course.details.career_prospects && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {course.details.career_prospects.slice(0, 2).map((career, idx) => (
                                  <span key={idx} className={`px-2 py-1 rounded text-xs ${
                                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {career}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Export Options */}
                  {prediction.predictions && prediction.predictions.length > 0 && (
                    <div className={`rounded-lg border p-4 ${
                      isDarkMode ? 'border-dark-border bg-dark-surface-secondary' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                        Export Results
                      </h4>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleExport('json')}
                          disabled={exportLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4" />
                          <span>JSON</span>
                        </button>
                        <button
                          onClick={() => handleExport('csv')}
                          disabled={exportLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>CSV</span>
                        </button>
                      </div>
                      {exportLoading && (
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'}`}>
                          Preparing download...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className={`rounded-lg shadow-lg p-6 ${
            isDarkMode ? 'bg-dark-surface border border-dark-border' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
              Help & FAQ
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                  How does the course recommender work?
                </h3>
                <p className={`${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                  Our intelligent system analyzes your UTME scores, O-Level grades, interests, and learning style to predict which courses you're eligible for at FUTA. It considers course requirements, your academic performance, and personal preferences to provide personalized recommendations.
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                  What information do I need to provide?
                </h3>
                <ul className={`list-disc list-inside space-y-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                  <li>Personal details (name, state, gender)</li>
                  <li>UTME score (0-400)</li>
                  <li>Exactly 4 UTME subjects (including English Language)</li>
                  <li>At least 5 O-Level subjects with grades (A1-C6)</li>
                  <li>Your interests and learning style</li>
                  <li>Preferred course (optional)</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                  How accurate are the predictions?
                </h3>
                <p className={`${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                  The predictions are based on FUTA's admission requirements and historical data. While we strive for accuracy, actual admission decisions depend on many factors including competition, available spaces, and specific departmental requirements. Use this as a guide, not a guarantee.
                </p>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                  What if I'm not eligible for any course?
                </h3>
                <p className={`${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                  If no courses are recommended, consider:
                </p>
                <ul className={`list-disc list-inside space-y-1 mt-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'}`}>
                  <li>Improving your UTME score through retaking the exam</li>
                  <li>Ensuring you have the required O-Level subjects and grades</li>
                  <li>Considering foundation or pre-degree programs</li>
                  <li>Exploring other universities with different requirements</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseRecommender;