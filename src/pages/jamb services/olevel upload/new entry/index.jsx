import React, { useReducer, useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { XCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

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

  // Initial form state with exactly 9 subjects
  const initialFormState = {
    fullname: initialFullname || '',
    profileCode: '',
    jambRegNo: '',
    courses: Array.from({ length: 9 }, () => ({
      subject: '',
      grade: '',
      regNo: '',
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
        if (course.year) filledFields++;
        if (course.examType) filledFields++;
      });
      setProgress(Math.round((filledFields / totalFields) * 100));
    };
    calculateProgress();
  }, [formData]);

  // Validation rules
  const validateJambRegNo = (regNo) => /^[0-9]{12}[A-Z]{2}$/.test(regNo);
  const validateYear = (year) => year >= 1980 && year <= new Date().getFullYear();
  const validateSubjects = (courses) => {
    const filledCourses = courses.filter(
      (course) => course.subject && course.grade && course.regNo && course.year && course.examType
    );
    const uniqueSubjects = new Set(filledCourses.map((course) => course.subject));
    return {
      isValid:
        filledCourses.length === 9 &&
        uniqueSubjects.size === filledCourses.length &&
        filledCourses.every((course) => validateYear(course.year)),
      errors: [
        filledCourses.length !== 9 ? 'All 9 subjects must be fully completed.' : '',
        uniqueSubjects.size !== filledCourses.length ? 'Duplicate subjects detected.' : '',
        filledCourses.some((course) => !validateYear(course.year)) ? 'Invalid year in subjects.' : '',
      ].filter(Boolean),
    };
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
      errors.forEach((error) => toast.error(error));
      setIsSubmitting(false);
      return;
    }
    if (formData.jambRegNo && !validateJambRegNo(formData.jambRegNo)) {
      toast.error('Invalid JAMB registration number format.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'courses') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'oLevelFile' || key === 'secondSittingFile') {
          if (value) formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Replace with your actual API endpoint
      await axios.post('https://api.example.com/jamb', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('O-Level entry submitted successfully!');
      localStorage.removeItem('oLevelFormData');
      setTimeout(() => {
        navigate('/completed', {
          state: {
            updatedEntry: {
              id,
              type,
              fullname: formData.fullname,
              profileCode: formData.profileCode || `PROFESS-${Math.floor(Math.random() * 90000)}`,
              status: 'Pending',
            },
          },
        });
      }, 2000);
    } catch (error) {
      toast.error('Submission failed. Please try again.');
      console.error('Submission error:', error);
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
    <div className="min-h-screen py-12 font-sans bg-gradient-to-b from-gray-100 to-green-50">
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 sm:px-6 lg:max-w-6xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Form Progress</h3>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full"
            >
              {progress}%
            </motion.span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-3 shadow-sm">
            <motion.div
              className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{ boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)' }}
            />
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-white bg-gradient-to-r from-green-600 to-green-800 p-4 rounded-lg mb-8 shadow-md"
        >
          O-Level Result Upload
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 bg-green-50 p-3 rounded-lg">Personal Information</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <input
                    type="text"
                    value={type || 'UTME'}
                    readOnly
                    className="mt-2 block w-full rounded-lg border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed focus:ring-green-500 focus:border-green-500 text-base py-3 px-4"
                    aria-label="Form type"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4 disabled:bg-gray-100"
                    placeholder="Enter full name"
                    required
                    disabled={isSubmitting}
                    aria-label="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">JAMB Reg. No. (Optional)</label>
                  <input
                    type="text"
                    value={formData.jambRegNo}
                    onChange={(e) => handleInputChange('jambRegNo', e.target.value)}
                    className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4 disabled:bg-gray-100"
                    placeholder="e.g., 12345678AB"
                    disabled={isSubmitting}
                    aria-label="JAMB registration number"
                  />
                </div>
              </div>
            </div>

            {/* Subjects Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 bg-green-50 p-3 rounded-lg">Subjects (All 9 required)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Grade</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Reg. No.</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Year</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Exam Type</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {formData.courses.map((course, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="hover:bg-green-50/50"
                        >
                          <td className="px-6 py-4">
                            <select
                              value={course.subject}
                              onChange={(e) => handleCourseChange(index, 'subject', e.target.value)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4 disabled:bg-gray-100"
                              disabled={isSubmitting}
                              aria-label={`Subject ${index + 1}`}
                              required
                            >
                              <option value="">Select Subject</option>
                              {oLevelSubjects.map((subject) => (
                                <option key={subject} value={subject}>
                                  {subject}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={course.grade}
                              onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4 disabled:bg-gray-100"
                              disabled={isSubmitting}
                              aria-label={`Grade ${index + 1}`}
                              required
                            >
                              <option value="">Select Grade</option>
                              {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((grade) => (
                                <option key={grade} value={grade}>{grade}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={course.regNo}
                              onChange={(e) => handleCourseChange(index, 'regNo', e.target.value)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4 disabled:bg-gray-100"
                              placeholder="Enter Reg. No."
                              disabled={isSubmitting}
                              aria-label={`Registration number ${index + 1}`}
                              required
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={course.year}
                              onChange={(e) => handleCourseChange(index, 'year', e.target.value)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4 disabled:bg-gray-100"
                              placeholder="Enter Year"
                              min="1980"
                              max={new Date().getFullYear()}
                              disabled={isSubmitting}
                              aria-label={`Year ${index + 1}`}
                              required
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={course.examType}
                              onChange={(e) => handleCourseChange(index, 'examType', e.target.value)}
                              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4 disabled:bg-gray-100"
                              disabled={isSubmitting}
                              aria-label={`Exam type ${index + 1}`}
                              required
                            >
                              <option value="">Select Exam Type</option>
                              {['WAEC', 'NECO', 'WAEC GCE', 'NECO GCE', 'NBAIS'].map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* File Uploads Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 bg-green-50 p-3 rounded-lg">File Uploads</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">O-Level Result File *</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('oLevelFile', e.target.files[0])}
                    className="mt-2 block w-full text-base text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 disabled:bg-gray-100"
                    accept=".pdf,.jpg,.png"
                    disabled={isSubmitting}
                    aria-label="O-Level result file upload"
                    required
                  />
                  {formData.oLevelFile && (
                    <div className="mt-3 flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <span className="text-base text-gray-600 truncate max-w-[250px]">{formData.oLevelFile.name}</span>
                      <button
                        type="button"
                        onClick={() => handleFileChange('oLevelFile', null)}
                        className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md p-2"
                        aria-label="Remove O-Level result file"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Second Sitting File (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('secondSittingFile', e.target.files[0])}
                    className="mt-2 block w-full text-base text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 disabled:bg-gray-100"
                    accept=".pdf,.jpg,.png"
                    disabled={isSubmitting}
                    aria-label="Second sitting file upload"
                  />
                  {formData.secondSittingFile && (
                    <div className="mt-3 flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <span className="text-base text-gray-600 truncate max-w-[250px]">{formData.secondSittingFile.name}</span>
                      <button
                        type="button"
                        onClick={() => handleFileChange('secondSittingFile', null)}
                        className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md p-2"
                        aria-label="Remove second sitting file"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Information (Optional)</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-green-500 focus:border-green-500 text-base py-3 px-4 disabled:bg-gray-100"
                placeholder="Provide any additional information..."
                disabled={isSubmitting}
                rows={5}
                aria-label="Additional information"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white text-base font-semibold rounded-lg hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-all duration-200"
                aria-label="Submit form"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                  </svg>
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Entry'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 inline-flex justify-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-500 text-white text-base font-semibold rounded-lg hover:from-gray-700 hover:to-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-all duration-200"
                disabled={isSubmitting}
                aria-label="Cancel form"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="flex-1 inline-flex justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-base font-semibold rounded-lg hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-all duration-200"
                disabled={isSubmitting}
                aria-label="Clear form"
              >
                Clear Form
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default OLevelEntry;