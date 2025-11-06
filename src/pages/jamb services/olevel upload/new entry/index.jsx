import React, { useReducer, useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { XCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { useDarkMode } from '../../../../contexts/DarkModeContext';

// Reducer for form state management
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'UPDATE_COURSE':
      const updatedCourses = [...state.courses];
      updatedCourses[action.index] = { ...updatedCourses[action.index], [action.key]: action.value };
      return { ...state, courses: updatedCourses };
    case 'SET_FILE':
      return { ...state, [action.field]: action.file };
    case 'RESET_FORM':
      return action.initialFormState;
    default:
      return state;
  }
};

const OLevelEntry = () => {
  const { state } = useLocation();
  const { id, type, quantity, amount, fullname: initialFullname } = state || {};
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  // Initial form state with exactly 9 subjects
  const initialFormState = {
    fullname: initialFullname || '',
    jambRegNo: '',
    profileCode: '',
    registrationNumber: '',
    courses: Array.from({ length: 9 }, () => ({
      subject: '',
      grade: '',
      regNo: '',
      examNo: '',
      year: '',
      examType: '',
    })),
    oLevelFile: null,
    secondSittingFile: null,
    additionalInfo: '',
  };

  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Comprehensive list of Nigerian O-Level subjects (sorted)
  const oLevelSubjects = [
    'Agricultural Science', 'Animal Husbandry', 'Arabic', 'Auto Mechanics', 'Basic Electricity',
    'Basic Electronics', 'Biology', 'Bookkeeping', 'Building Construction', 'Chemistry',
    'Christian Religious Studies', 'Civic Education', 'Clothing and Textiles', 'Commerce',
    'Computer Studies', 'Data Processing', 'Economics', 'English Language', 'Financial Accounting',
    'Fisheries', 'Food and Nutrition', 'French', 'Further Mathematics', 'Garment Making',
    'General Mathematics', 'Geography', 'Government', 'Hausa', 'Health Education', 'History',
    'Home Management', 'Igbo', 'Insurance', 'Islamic Religious Studies', 'Literature-in-English',
    'Marketing', 'Metal Work', 'Music', 'Office Practice', 'Physical Education', 'Physics',
    'Store Management', 'Technical Drawing', 'Visual Art', 'Woodwork', 'Yoruba'
  ].sort();

  // Calculate form completion progress
  useEffect(() => {
    const calculateProgress = () => {
      let filledFields = 0;
      const totalFields = formData.courses.length * 5 + 2; // 5 fields per course + fullname + oLevelFile
      if (formData.fullname.trim()) filledFields++;
      if (formData.oLevelFile) filledFields++;
      formData.courses.forEach((course) => {
        if (course.subject) filledFields++;
        if (course.grade) filledFields++;
        if (course.regNo) filledFields++;
        if (course.examNo) filledFields++;
        if (course.year) filledFields++;
        if (course.examType) filledFields++;
      });
      setProgress(Math.round((filledFields / totalFields) * 100));
    };
    calculateProgress();
  }, [formData]);

  // Validation rules
  const validateJambRegNo = (regNo) => /^[0-9]{12}[A-Z]{2}$/.test(regNo);
  const validateProfileCode = (code) => /^[A-Z0-9]{8,12}$/.test(code);
  const validateYear = (year) => year >= 1980 && year <= new Date().getFullYear();
  const validateExamNo = (examNo) => /^[A-Z0-9]{8,12}$/.test(examNo);

  const validateSubjects = (courses) => {
    console.log('Validating courses:', courses);

    const filledCourses = courses.filter(
      (course) => {
        const isFilled = course.subject && 
                        course.grade && 
                        course.examNo && 
                        course.year && 
                        course.examType;
        
        if (!isFilled) {
          console.log('Unfilled course:', course);
        }
        return isFilled;
      }
    );

    console.log('Filled courses count:', filledCourses.length);

    const uniqueSubjects = new Set(filledCourses.map((course) => course.subject));
    const validationResult = {
      isValid:
        filledCourses.length === 9 &&
        uniqueSubjects.size === filledCourses.length &&
        filledCourses.every((course) => validateYear(course.year)) &&
        filledCourses.every((course) => validateExamNo(course.examNo)),
      errors: [
        filledCourses.length !== 9 ? 'All 9 subjects must be fully completed.' : '',
        uniqueSubjects.size !== filledCourses.length ? 'Duplicate subjects detected.' : '',
        filledCourses.some((course) => !validateYear(course.year)) ? 'Invalid year in subjects.' : '',
        filledCourses.some((course) => !validateExamNo(course.examNo)) ? 'Invalid examination number format.' : '',
      ].filter(Boolean),
    };

    console.log('Validation result:', validationResult);
    return validationResult;
  };

  // Autosave to localStorage
  useEffect(() => {
    const saveFormData = setTimeout(() => {
      localStorage.setItem('oLevelFormData', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(saveFormData);
  }, [formData]);

  // Load saved form data
  useEffect(() => {
    const savedData = localStorage.getItem('oLevelFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.entries(parsedData).forEach(([field, value]) => {
        if (field !== 'courses') {
          dispatch({ type: 'UPDATE_FIELD', field, value });
        } else {
          value.forEach((course, index) => {
            if (index < formData.courses.length) {
              Object.entries(course).forEach(([key, val]) => {
                dispatch({ type: 'UPDATE_COURSE', index, key, value: val });
              });
            }
          });
        }
      });
    }
    if (!state) {
      toast.error('Invalid navigation. Redirecting...');
      setTimeout(() => navigate('/forms'), 1500);
    }
  }, [state, navigate, formData.courses.length]);

  // Handlers
  const handleInputChange = useCallback((field, value) => {
    dispatch({ type: 'UPDATE_FIELD', field, value });
  }, []);

  const handleCourseChange = useCallback((index, key, value) => {
    dispatch({ type: 'UPDATE_COURSE', index, key, value });
  }, []);

  const handleFileChange = (field, file) => {
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF, JPEG, or PNG file.');
        return;
      }
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB.');
        return;
      }
      dispatch({ type: 'SET_FILE', field, file });
      toast.success(`${field === 'oLevelFile' ? 'O-Level' : 'Second sitting'} file uploaded.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Form data before validation:', formData);

    // Validate JAMB registration number
    if (!formData.jambRegNo.trim()) {
      toast.error('Please enter your JAMB registration number.');
      setIsSubmitting(false);
      return;
    }

    if (!validateJambRegNo(formData.jambRegNo)) {
      toast.error('Invalid JAMB registration number format. It should be 12 digits followed by 2 letters (e.g., 123456789012AB).');
      setIsSubmitting(false);
      return;
    }

    // Validate profile code if provided
    if (formData.profileCode.trim() && !validateProfileCode(formData.profileCode)) {
      toast.error('Invalid profile code format.');
      setIsSubmitting(false);
      return;
    }

    const { isValid, errors } = validateSubjects(formData.courses);
    if (!formData.fullname.trim()) {
      toast.error('Please enter a full name.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.oLevelFile) {
      toast.error('Please upload an O-Level result file.');
      setIsSubmitting(false);
      return;
    }
    if (!isValid) {
      console.log('Validation errors:', errors);
      errors.forEach((error) => toast.error(error));
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullname', formData.fullname);
      formDataToSend.append('jambRegNo', formData.jambRegNo);
      formDataToSend.append('profileCode', formData.profileCode);
      formDataToSend.append('courses', JSON.stringify(formData.courses));
      formDataToSend.append('oLevelFile', formData.oLevelFile);

      console.log('Sending form data:', {
        fullname: formData.fullname,
        jambRegNo: formData.jambRegNo,
        profileCode: formData.profileCode,
        courses: formData.courses,
        file: formData.oLevelFile
      });

      const response = await axios.post(
        'http://localhost:5000/api/olevel/upload',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast.success('O-Level entry submitted successfully!');
        // Generate a unique ID for the entry
        const entryId = `entry_${Date.now()}`;
        // Navigate back to the dashboard/buy-olevel-upload page with processing state
        navigate('/dashboard/buy-olevel-upload', {
          state: {
            status: 'processing',
            entryId: entryId,
            profileCode: response.data.profileCode || formData.profileCode,
            jambRegNo: formData.jambRegNo,
            fullname: formData.fullname,
            type: 'UTME',
            quantity: 1,
            amount: '₦400'
          }
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      localStorage.removeItem('oLevelFormData');
      navigate('/forms');
    }
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      dispatch({ type: 'RESET_FORM', initialFormState });
      localStorage.removeItem('oLevelFormData');
      toast.success('Form cleared successfully.');
    }
  };

  return (
    <div className={`min-h-screen py-12 font-sans transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gradient-to-b from-gray-100 to-green-50'
    }`}>
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 sm:px-6 lg:max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className={`text-lg font-semibold ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>Form Progress</h2>
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
            }`}>{progress}% Complete</span>
          </div>
          <div className={`h-2 rounded-full ${
            isDarkMode ? 'bg-dark-border' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full rounded-full ${
                isDarkMode ? 'bg-green-600' : 'bg-green-500'
              }`}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className={`${
          isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white border-gray-100'
        } rounded-2xl shadow-xl p-6 md:p-8 border`}>
          <div className="flex justify-between items-center mb-8">
            <h1 className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>O-Level Entry Form</h1>
            <div className="flex gap-4">
              <button
                onClick={handleClearForm}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-dark-surface hover:bg-dark-border text-dark-text-primary' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Clear Form
              </button>
              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-red-900/30 text-red-400 hover:bg-red-900/40' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-secondary' 
                        : 'border-gray-200 placeholder-gray-400'
                    }`}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                  }`}>
                    JAMB Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.jambRegNo}
                    onChange={(e) => handleInputChange('jambRegNo', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-secondary' 
                        : 'border-gray-200 placeholder-gray-400'
                    }`}
                    placeholder="Enter JAMB registration number"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                  }`}>
                    Profile Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.profileCode}
                    onChange={(e) => handleInputChange('profileCode', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-secondary' 
                        : 'border-gray-200 placeholder-gray-400'
                    }`}
                    placeholder="Enter profile code (optional)"
                  />
                </div>
              </div>
            </div>

            {/* O-Level Results */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>O-Level Results</h3>
              <div className="grid grid-cols-1 gap-6">
                {formData.courses.map((course, index) => (
                  <div key={index} className={`p-4 rounded-xl border ${
                    isDarkMode ? 'border-dark-border bg-dark-surface' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                        }`}>
                          Subject {index + 1}
                        </label>
                        <select
                          value={course.subject}
                          onChange={(e) => handleCourseChange(index, 'subject', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                              : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select Subject</option>
                          {oLevelSubjects.map((subject) => (
                            <option key={subject} value={subject} className={
                              isDarkMode ? 'bg-dark-surface text-dark-text-primary' : ''
                            }>{subject}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                        }`}>
                          Grade
                        </label>
                        <select
                          value={course.grade}
                          onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                              : 'border-gray-200'
                          }`}
                        >
                          <option value="">Grade</option>
                          {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((grade) => (
                            <option key={grade} value={grade} className={
                              isDarkMode ? 'bg-dark-surface text-dark-text-primary' : ''
                            }>{grade}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                        }`}>
                          Exam Number
                        </label>
                        <input
                          type="text"
                          value={course.examNo}
                          onChange={(e) => handleCourseChange(index, 'examNo', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                              : 'border-gray-200'
                          }`}
                          placeholder="Enter exam number"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                        }`}>
                          Exam Type
                        </label>
                        <select
                          value={course.examType}
                          onChange={(e) => handleCourseChange(index, 'examType', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                              : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select</option>
                          {['WAEC', 'NECO', 'NABTEB'].map((type) => (
                            <option key={type} value={type} className={
                              isDarkMode ? 'bg-dark-surface text-dark-text-primary' : ''
                            }>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                        }`}>
                          Year
                        </label>
                        <input
                          type="number"
                          value={course.year}
                          onChange={(e) => handleCourseChange(index, 'year', e.target.value)}
                          min="1980"
                          max={new Date().getFullYear()}
                          className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                              : 'border-gray-200'
                          }`}
                          placeholder="YYYY"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>Document Upload</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                  }`}>
                    O-Level Result (Required)
                  </label>
                  <div className={`p-4 border-2 border-dashed rounded-xl text-center ${
                    isDarkMode 
                      ? 'border-dark-border hover:border-green-600' 
                      : 'border-gray-300 hover:border-green-500'
                  }`}>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('oLevelFile', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="oLevelFile"
                    />
                    <label htmlFor="oLevelFile" className="cursor-pointer">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                      }`}>
                        {formData.oLevelFile ? (
                          <span className="text-green-500">
                            {formData.oLevelFile.name}
                          </span>
                        ) : (
                          <>
                            <span className={`font-medium ${
                              isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                            }`}>Click to upload</span> or drag and drop
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Entry'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OLevelEntry;