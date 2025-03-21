import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const OLevelEntry = () => {
  const { state } = useLocation();
  const { id, type, quantity, amount, fullname: initialFullname } = state || {};
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: initialFullname || '',
    profileCode: '',
    jambRegNo: '',
    courses: Array.from({ length: 9 }, () => ({
      subject: '',
      grade: '',
      regNo: '',
      year: '',
      examType: 'WAEC',
    })),
    oLevelFile: null,
    secondSittingFile: null,
    additionalInfo: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const waecSubjects = [
    'English Language', 'Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Agricultural Science', 'Geography', 'Economics', 'Commerce', 'Accounting', 'Government',
    'History', 'Christian Religious Studies', 'Islamic Religious Studies', 'Literature in English',
    'French', 'Arabic', 'Hausa', 'Igbo', 'Yoruba', 'Civic Education', 'Data Processing',
    'Physical Education', 'Health Science', 'Food and Nutrition', 'Home Management',
    'Clothing and Textiles', 'Technical Drawing', 'Auto Mechanics', 'Building Construction',
    'Metal Work', 'Wood Work', 'Electrical Installation and Maintenance Work', 'Electronics',
    'Computer Studies', 'Basic Electricity', 'Basic Electronics', 'Applied Electricity', 'Tourism',
    'Insurance', 'Store Keeping', 'Office Practice', 'Salesmanship', 'Financial Accounting',
    'Marketing', 'Music', 'Visual Arts', 'Sculpture', 'Painting and Decorating', 'Textile',
    'Leatherwork', 'Ceramics', 'Jewelry', 'Photography', 'Graphic Design'
  ].sort();

  useEffect(() => {
    if (!state) navigate('/homepage/buy-olevel-upload');
  }, [state, navigate]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCourseChange = (index, key, value) => {
    const updatedCourses = [...formData.courses];
    updatedCourses[index] = { ...updatedCourses[index], [key]: value };
    setFormData({ ...formData, courses: updatedCourses });
  };

  const handleFileChange = (field, file) => {
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (!validTypes.includes(file.type)) {
        setMessage({ text: 'Please upload a PDF, JPEG, or PNG file.', type: 'error' });
        return;
      }
      if (file.size > maxSize) {
        setMessage({ text: 'File size must be less than 5MB.', type: 'error' });
        return;
      }
    }
    setFormData({ ...formData, [field]: file });
  };

  const validateForm = () => {
    const filledCourses = formData.courses.filter(
      (course) => course.subject && course.grade && course.regNo && course.year
    );
    if (!formData.fullname.trim()) {
      setMessage({ text: 'Please enter a fullname.', type: 'error' });
      return false;
    }
    if (filledCourses.length < 8) {
      setMessage({ text: 'Please fill in at least 8 subjects.', type: 'error' });
      return false;
    }
    if (filledCourses.length > 9) {
      setMessage({ text: 'Maximum of 9 subjects allowed.', type: 'error' });
      return false;
    }
    const incompleteCourses = filledCourses.some(
      (course) => !course.subject || !course.grade || !course.regNo || !course.year
    );
    if (incompleteCourses) {
      setMessage({ text: 'Please complete all subject details.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMessage({ text: 'O-Level entry submitted successfully!', type: 'success' });

      // Navigate back to parent with updated data
      setTimeout(() => {
        navigate('/homepage/buy-olevel-upload', {
          state: {
            updatedEntry: {
              id,
              type,
              fullname: formData.fullname,
              profileCode: formData.profileCode || `PROF-${Math.floor(10000 + Math.random() * 90000)}`,
              status: 'Processed',
            },
          },
        });
      }, 2000);
    } catch (error) {
      setMessage({ text: 'Submission failed. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/homepage/buy-olevel-upload');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-nunito">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-text-color mb-8 border-b-2 border-gray-200 pb-4">
          Create O-Level Upload Entry
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <input
                type="text"
                value={type || 'UTME'}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Fullname */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) => handleInputChange('fullname', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                placeholder="Enter full name"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Profile Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Code (Optional)</label>
              <input
                type="text"
                value={formData.profileCode}
                onChange={(e) => handleInputChange('profileCode', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                placeholder="Enter profile code"
                disabled={isSubmitting}
              />
            </div>

            {/* JAMB Registration Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">JAMB Registration No. (Optional)</label>
              <input
                type="text"
                value={formData.jambRegNo}
                onChange={(e) => handleInputChange('jambRegNo', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                placeholder="Enter JAMB registration number"
                disabled={isSubmitting}
              />
            </div>

            {/* Courses Table */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects (Min 8, Max 9)</label>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Subject</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Grade</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Reg. No.</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Year</th>
                      <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Exam Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.courses.map((course, index) => (
                      <tr key={index} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6">
                          <select
                            value={course.subject}
                            onChange={(e) => handleCourseChange(index, 'subject', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                            disabled={isSubmitting}
                          >
                            <option value="">Select Subject</option>
                            {waecSubjects.map((subject) => (
                              <option key={subject} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <select
                            value={course.grade}
                            onChange={(e) => handleCourseChange(index, 'grade', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                            disabled={isSubmitting}
                          >
                            <option value="">Select Grade</option>
                            {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'].map((grade) => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="text"
                            value={course.regNo}
                            onChange={(e) => handleCourseChange(index, 'regNo', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                            placeholder="Reg. No."
                            disabled={isSubmitting}
                          />
                        </td>
                        <td className="py-3 px-6">
                          <input
                            type="number"
                            value={course.year}
                            onChange={(e) => handleCourseChange(index, 'year', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                            placeholder="Year"
                            min="2000"
                            max="2025"
                            disabled={isSubmitting}
                          />
                        </td>
                        <td className="py-3 px-6">
                          <select
                            value={course.examType}
                            onChange={(e) => handleCourseChange(index, 'examType', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                            disabled={isSubmitting}
                          >
                            <option value="WAEC">WAEC</option>
                            <option value="NECO">NECO</option>
                            <option value="WAEC-GCE">WAEC GCE</option>
                            <option value="NECO-GCE">NECO GCE</option>
                            <option value="NVAIS">NBAIS</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* File Uploads */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">O-Level Result File</label>
              <input
                type="file"
                onChange={(e) => handleFileChange('oLevelFile', e.target.files[0])}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                accept=".pdf,.jpg,.png"
                disabled={isSubmitting}
              />
              {formData.oLevelFile && <p className="text-sm text-gray-600 mt-1">{formData.oLevelFile.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Second Sitting (Optional)</label>
              <input
                type="file"
                onChange={(e) => handleFileChange('secondSittingFile', e.target.files[0])}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                accept=".pdf,.jpg,.png"
                disabled={isSubmitting}
              />
              {formData.secondSittingFile && <p className="text-sm text-gray-600 mt-1">{formData.secondSittingFile.name}</p>}
            </div>

            {/* Additional Information */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Information (Optional)</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 h-32"
                placeholder="Enter additional information..."
                disabled={isSubmitting}
              />
            </div>

            {/* Message */}
            {message.text && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-3 rounded-lg text-sm font-medium ${
                  message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-color text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" /></svg>}
                {isSubmitting ? 'Submitting...' : 'Submit Entry'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default OLevelEntry;