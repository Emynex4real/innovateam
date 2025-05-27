import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiHome, FiArrowLeft } from "react-icons/fi";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useDarkMode } from "../../contexts/DarkModeContext";

const Register = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { isDarkMode } = useDarkMode();

  const getStrengthColor = (index, strength) => {
    if (index >= strength) return isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getStrengthTextColor = (strength) => {
    if (strength <= 1) return isDarkMode ? 'text-red-400' : 'text-red-600';
    if (strength === 2) return isDarkMode ? 'text-yellow-400' : 'text-yellow-600';
    if (strength === 3) return isDarkMode ? 'text-green-400' : 'text-green-600';
    return isDarkMode ? 'text-green-400' : 'text-green-700';
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      if (name === 'confirmPassword' && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else if (name === 'password' && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid phone number (10-15 digits)";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await authRegister(formData);
      if (result.success) {
        toast.success("Account created successfully!");
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false,
        });
        navigate("/login");
      } else {
        throw new Error(result.error || "Failed to create account");
      }
    } catch (error) {
      const errorMessage = error?.message || "Failed to create account. Please try again.";
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100' 
        : 'bg-gradient-to-br from-primary-color/10 via-white to-gray-50'
    }`}>
      <Link 
        to="/" 
        className={`absolute top-4 left-4 flex items-center gap-2 ${
          isDarkMode ? 'text-gray-300 hover:text-primary-color' : 'text-gray-600 hover:text-primary-color'
        } transition-colors duration-200`}
      >
        <FiArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-md w-full rounded-2xl shadow-xl p-8 space-y-6 font-inter backdrop-blur-sm border ${
          isDarkMode 
            ? 'bg-gray-800/90 border-gray-700 text-gray-100' 
            : 'bg-white/90 border-white/20'
        }`}
      >
        <div className="text-center">
          <motion.h2
            className={`text-3xl font-bold font-poppins ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create Account
          </motion.h2>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join us and start your journey
          </p>
        </div>

        <AnimatePresence>
          {errors.submit && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-md ${
                isDarkMode 
                  ? 'bg-red-900/50 border border-red-800 text-red-200' 
                  : 'bg-red-50 border-l-4 border-red-500 text-red-700'
              }`}
            >
              {errors.submit}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Name Input */}
            <div>
              <label htmlFor="name" className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Full Name
              </label>
              <div className="relative mt-1">
                <FiUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-primary-color/50 focus:border-primary-color' 
                      : 'border-gray-300 focus:ring-primary-color focus:border-primary-color bg-white/50 text-gray-900'
                  }`}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative mt-1">
                <FiMail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-primary-color/50 focus:border-primary-color' 
                      : 'border-gray-300 focus:ring-primary-color focus:border-primary-color bg-white/50 text-gray-900'
                  }`}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Phone Number Input */}
            <div>
              <label htmlFor="phoneNumber" className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Phone Number
              </label>
              <div className="relative mt-1">
                <FiPhone className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-primary-color/50 focus:border-primary-color' 
                      : 'border-gray-300 focus:ring-primary-color focus:border-primary-color bg-white/50 text-gray-900'
                  }`}
                  placeholder="1234567890"
                  disabled={isLoading}
                />
              </div>
              {errors.phoneNumber && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
                >
                  {errors.phoneNumber}
                </motion.p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative mt-1">
                <FiLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-primary-color/50 focus:border-primary-color' 
                      : 'border-gray-300 focus:ring-primary-color focus:border-primary-color bg-white/50 text-gray-900'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Confirm Password
              </label>
              <div className="relative mt-1">
                <FiLock className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-primary-color/50 focus:border-primary-color' 
                      : 'border-gray-300 focus:ring-primary-color focus:border-primary-color bg-white/50 text-gray-900'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-green-100 bg-white'
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {[...Array(4)].map((_, index) => (
                    <div 
                      key={index}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${getStrengthColor(index, passwordStrength)}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-sm font-medium ${getStrengthTextColor(passwordStrength)}`}>
                    {passwordStrength === 0 && 'Very Weak'}
                    {passwordStrength === 1 && 'Weak'}
                    {passwordStrength === 2 && 'Medium'}
                    {passwordStrength === 3 && 'Strong'}
                    {passwordStrength === 4 && 'Very Strong'}
                  </p>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {passwordStrength < 4 && (
                      <ul className="list-disc list-inside">
                        {!/.{8,}/.test(formData.password) && <li>At least 8 characters</li>}
                        {!/[A-Z]/.test(formData.password) && <li>One uppercase letter</li>}
                        {!/[0-9]/.test(formData.password) && <li>One number</li>}
                        {!/[^A-Za-z0-9]/.test(formData.password) && <li>One special character</li>}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className={`w-4 h-4 rounded border transition-colors duration-200 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-primary-color focus:ring-primary-color/50'
                      : 'border-gray-300 text-primary-color focus:ring-primary-color'
                  }`}
                  disabled={isLoading}
                />
              </div>
              <label htmlFor="agreeToTerms" className={`ml-2 block text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                I agree to the{" "}
                <Link to="/terms" className={`font-medium ${
                  isDarkMode 
                    ? 'text-primary-color hover:text-primary-color/80' 
                    : 'text-primary-color hover:text-primary-color/90'
                }`}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className={`font-medium ${
                  isDarkMode 
                    ? 'text-primary-color hover:text-primary-color/80' 
                    : 'text-primary-color hover:text-primary-color/90'
                }`}>
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
              >
                {errors.agreeToTerms}
              </motion.p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                isLoading 
                  ? 'bg-primary-color/70 cursor-not-allowed' 
                  : 'bg-primary-color hover:bg-primary-color/90'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Social Login Section */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                }`}>Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => toast.error('Google sign up coming soon!')}
                className={`flex justify-center items-center py-2 px-4 border rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FaGoogle className="w-5 h-5 text-red-500" />
              </button>
              <button
                type="button"
                onClick={() => toast.error('Facebook sign up coming soon!')}
                className={`flex justify-center items-center py-2 px-4 border rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FaFacebook className="w-5 h-5 text-blue-600" />
              </button>
              <button
                type="button"
                onClick={() => toast.error('Twitter sign up coming soon!')}
                className={`flex justify-center items-center py-2 px-4 border rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FaTwitter className="w-5 h-5 text-blue-400" />
              </button>
            </div>
          </motion.div>
        </form>

        <div className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Already have an account?{" "}
          <Link
            to="/login"
            className={`font-medium ${
              isDarkMode 
                ? 'text-primary-color hover:text-primary-color/80' 
                : 'text-primary-color hover:text-primary-color/90'
            }`}
          >
            Sign in
          </Link>
        </div>
      </motion.div>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
};

export default Register;