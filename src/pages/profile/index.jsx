import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiCalendar, FiEye, FiEyeOff, FiCamera, FiCheck, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { debounce } from 'lodash';

const Profile = memo(() => {
  const { user, updateProfile, logout } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthdate: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Validate password strength
  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Please enter an email';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
    if (formData.phone && !/^[\d\s-+()]+$/.test(formData.phone)) errors.phone = 'Invalid phone';
    if (showChangePassword) {
      if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
      if (!formData.newPassword) errors.newPassword = 'New password is required';
      else if (formData.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
      if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  // Calculate progress
  useEffect(() => {
    const calculateProgress = () => {
      let filledFields = 0;
      const totalFields = 5; // name, email, phone, address, birthdate
      if (formData.name.trim()) filledFields++;
      if (formData.email) filledFields++;
      if (formData.phone) filledFields++;
      if (formData.address) filledFields++;
      if (formData.birthdate) filledFields++;
      setProgress(Math.round((filledFields / totalFields) * 100));
    };
    calculateProgress();
  }, [formData]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        birthdate: user.birthdate || '',
        avatar: user.avatar || '',
      }));
    }
  }, [user]);

  // Update password strength
  useEffect(() => {
    if (formData.newPassword) {
      setPasswordStrength(validatePassword(formData.newPassword));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.newPassword]);

  // Autosave to localStorage
  useEffect(() => {
    const debouncedSave = debounce(() => {
      localStorage.setItem('profileFormData', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        birthdate: formData.birthdate,
      }));
    }, 500);
    debouncedSave();
    return () => debouncedSave.cancel();
  }, [formData.name, formData.email, formData.phone, formData.address, formData.birthdate]);

  // Load saved form data
  useEffect(() => {
    const savedData = localStorage.getItem('profileFormData');
    if (savedData) {
      setFormData((prev) => ({ ...prev, ...JSON.parse(savedData) }));
    }
  }, []);

  // Debounced input handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  // Avatar handling
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatar(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatar(file);
    }
  };

  const processAvatar = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or GIF image.');
      return;
    }
    if (file.size > maxSize) {
      toast.error('Image size must be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatar: reader.result }));
      toast.success('Avatar updated locally. Save changes to confirm.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (window.confirm('Are you sure you want to remove your avatar?')) {
      setFormData((prev) => ({ ...prev, avatar: '' }));
      toast.success('Avatar removed locally.');
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Object.values(errors).forEach((err) => toast.error(err));
      return;
    }
    setLoading(true);
    try {
      if (typeof updateProfile !== 'function') {
        console.warn('updateProfile is not a function. Check AuthContext implementation.');
        toast.error('Profile update is not available. Please try again later.');
        return;
      }
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        birthdate: formData.birthdate,
        avatar: formData.avatar,
      });
      toast.success('Profile updated successfully!');
      localStorage.removeItem('profileFormData');
    } catch (err) {
      const errorMsg = err.message || 'Failed to update profile. Please try again.';
      toast.error(errorMsg);
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.currentPassword || errors.newPassword || errors.confirmPassword) {
      setFormErrors(errors);
      Object.values(errors).forEach((err) => toast.error(err));
      return;
    }
    if (!window.confirm('Are you sure you want to change your password?')) return;
    setLoading(true);
    try {
      if (typeof updateProfile !== 'function') {
        console.warn('updateProfile is not a function. Check AuthContext implementation.');
        toast.error('Password change is not available. Please try again later.');
        return;
      }
      await updateProfile({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully!');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setShowChangePassword(false);
    } catch (err) {
      const errorMsg = err.message || 'Failed to change password. Please try again.';
      toast.error(errorMsg);
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        birthdate: user?.birthdate || '',
        avatar: user?.avatar || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setFormErrors({});
      localStorage.removeItem('profileFormData');
      toast.success('Form reset successfully.');
    }
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      toast.success('Logged out successfully.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-t-green-500 border-gray-200 rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-12 font-sans bg-white text-gray-900"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !showChangePassword) handleSubmit(e);
        if (e.key === 'Escape') handleReset();
      }}
    >
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 sm:px-6 lg:max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Profile Completion</span>
            <span className="text-sm font-medium text-green-500">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-gray-900 flex items-center justify-center"
        >
          <FiUser className="w-8 h-8 mr-2 text-green-500" />
          Profile
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          {/* Avatar Section */}
          <div
            className={`flex justify-center mb-6 relative ${isDragging ? 'bg-gray-100' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-32 h-32 rounded-full overflow-hidden cursor-pointer relative border-2 border-green-500"
              onClick={handleAvatarClick}
            >
              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <FiUser className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <FiCamera className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
              aria-label="Upload profile avatar"
            />
            {formData.avatar && (
              <motion.button
                whileHover={{ scale: 1.2 }}
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-sm"
                aria-label="Remove avatar"
              >
                <FiX className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <motion.input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`peer w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-green-500 ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder="Full Name"
                    disabled={loading}
                    aria-label="Full name"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
                  >
                    Full Name *
                  </label>
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                  {!formErrors.name && formData.name && (
                    <FiCheck className="absolute right-3 top-3 text-green-500" />
                  )}
                </div>
                <div className="relative">
                  <motion.input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`peer w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-green-500 ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder="Email"
                    disabled={loading}
                    aria-label="Email address"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
                  >
                    Email *
                  </label>
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                  {!formErrors.email && formData.email && /\S+@\S+\.\S+/.test(formData.email) && (
                    <FiCheck className="absolute right-3 top-3 text-green-500" />
                  )}
                </div>
                <div className="relative">
                  <motion.input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`peer w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-green-500 ${formErrors.phone ? 'border-red-500' : ''}`}
                    placeholder="Phone"
                    disabled={loading}
                    aria-label="Phone number"
                    whileFocus={{ scale: 1.01 }}
                  />
                  <label
                    htmlFor="phone"
                    className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
                  >
                    Phone
                  </label>
                  {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
                  {!formErrors.phone && formData.phone && /^[\d\s-+()]+$/.test(formData.phone) && (
                    <FiCheck className="absolute right-3 top-3 text-green-500" />
                  )}
                </div>
                <div className="relative">
                  <motion.input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="peer w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-green-500"
                    placeholder="Address"
                    disabled={loading}
                    aria-label="Address"
                    whileFocus={{ scale: 1.01 }}
                  />
                  <label
                    htmlFor="address"
                    className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
                  >
                    Address
                  </label>
                  {formData.address && <FiCheck className="absolute right-3 top-3 text-green-500" />}
                </div>
                <div className="relative sm:col-span-2">
                  <motion.input
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className="peer w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-green-500"
                    disabled={loading}
                    aria-label="Birthdate"
                    whileFocus={{ scale: 1.01 }}
                  />
                  <label
                    htmlFor="birthdate"
                    className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
                  >
                    Birthdate
                  </label>
                  {formData.birthdate && <FiCheck className="absolute right-3 top-3 text-green-500" />}
                </div>
              </div>
            </div>

            {/* Password Change */}
            <AnimatePresence>
              {showChangePassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 mt-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <motion.input
                        type={showPassword ? 'text' : 'password'}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={`peer w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-green-500 ${formErrors.currentPassword ? 'border-red-500' : ''}`}
                        placeholder="Current Password"
                        disabled={loading}
                        aria-label="Current password"
                        required
                        whileFocus={{ scale: 1.01 }}
                      />
                      <label
                        htmlFor="currentPassword"
                        className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
                      >
                        Current Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                      {formErrors.currentPassword && <p className="mt-1 text-sm text-red-500">{formErrors.currentPassword}</p>}
                      {!formErrors.currentPassword && formData.currentPassword && (
                        <FiCheck className="absolute right-10 top-3 text-green-500" />
                      )}
                    </div>
                    <div className="relative">
                      <motion.input
                        type={showPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={`peer w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-green-500 ${formErrors.newPassword ? 'border-red-500' : ''}`}
                        placeholder="New Password"
                        disabled={loading}
                        aria-label="New password"
                        required
                        whileFocus={{ scale: 1.01 }}
                      />
                      <label
                        htmlFor="newPassword"
                        className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
                      >
                        New Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                      {formErrors.newPassword && <p className="mt-1 text-sm text-red-500">{formErrors.newPassword}</p>}
                      {!formErrors.newPassword && formData.newPassword && (
                        <FiCheck className="absolute right-10 top-3 text-green-500" />
                      )}
                      {formData.newPassword && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 space-y-1"
                        >
                          <div className="flex gap-1">
                            {[...Array(4)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${i < passwordStrength ? 'bg-green-500' : 'bg-gray-200'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600">
                            Must include: 8+ characters, uppercase, number, special character
                          </p>
                        </motion.div>
                      )}
                    </div>
                    <div className="relative">
                      <motion.input
                        type={showPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`peer w-full bg-white border border-gray-300 rounded-md px-4 py-2 text-gray-900 placeholder-transparent focus:outline-none focus:border-green-500 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="Confirm Password"
                        disabled={loading}
                        aria-label="Confirm new password"
                        required
                        whileFocus={{ scale: 1.01 }}
                      />
                      <label
                        htmlFor="confirmPassword"
                        className="absolute left-4 -top-2.5 text-sm text-gray-600 bg-white px-1 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
                      >
                        Confirm Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                      {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>}
                      {!formErrors.confirmPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                        <FiCheck className="absolute right-10 top-3 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      disabled={loading}
                      aria-label="Cancel password change"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      type="button"
                      onClick={handlePasswordChange}
                      className="px-6 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      disabled={loading}
                      aria-label="Change password"
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                        </svg>
                      ) : (
                        <FiCheck className="w-5 h-5 mr-2 inline" />
                      )}
                      Change Password
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Profile Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-white rounded-md p-4 flex items-center gap-4 border border-gray-200"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img
                  src={formData.avatar || 'https://via.placeholder.com/48'}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-base font-medium text-gray-900">{formData.name || 'Your Name'}</p>
                <p className="text-sm text-gray-600">{formData.email || 'your.email@example.com'}</p>
              </div>
            </motion.div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                aria-label="Save profile changes"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 inline" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                  </svg>
                ) : (
                  <FiCheck className="w-5 h-5 mr-2 inline" />
                )}
                Save Changes
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                type="button"
                onClick={handleReset}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                disabled={loading}
                aria-label="Reset form"
              >
                Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                type="button"
                onClick={() => setShowChangePassword(!showChangePassword)}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-900 rounded-md font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                disabled={loading}
                aria-label={showChangePassword ? 'Hide password settings' : 'Show password settings'}
              >
                {showChangePassword ? 'Hide Password' : 'Change Password'}
              </motion.button>
            </div>
          </form>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleLogout}
            className="w-full mt-6 px-6 py-2 bg-green-500 text-white rounded-md font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            disabled={loading}
            aria-label="Log out"
          >
            <FiLock className="w-5 h-5 mr-2 inline" />
            Logout
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
});

export default Profile;