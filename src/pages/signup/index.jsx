import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiHome } from "react-icons/fi";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const SignupPage = () => {
  const getStrengthColor = (index, strength) => {
    if (index >= strength) return 'bg-gray-200';
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-green-500';
    return 'bg-green-600';
  };

  const getStrengthTextColor = (strength) => {
    if (strength <= 1) return 'text-red-600';
    if (strength === 2) return 'text-yellow-600';
    if (strength === 3) return 'text-green-600';
    return 'text-green-700';
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
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();

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

    // Real-time password match validation
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
      await authRegister(formData.email, formData.password);
      toast.success('Account created successfully!');
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
      });
      navigate('/login');
    } catch (error) {
      const errorMessage = error?.message || 'Failed to create account. Please try again.';
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-700 flex items-center justify-center p-4 font-nunito relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(40deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-subtle-shift"></div>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500/10 rounded-full filter blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-green-200/20 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-300/10 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
      </div>
      <div className="absolute top-4 left-4 flex items-center gap-4">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-gray-600 hover:text-primary-color transition-colors duration-200"
        >
          <FiHome className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link 
          to="/login" 
          className="flex items-center gap-2 text-gray-600 hover:text-primary-color transition-colors duration-200"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transition-all duration-300 hover:shadow-2xl border-t border-l border-white/20 relative z-10 backdrop-blur-xl bg-white/90"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-green-500/20 ring-4 ring-white ring-offset-4 ring-offset-green-100">
              <FiUser className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent drop-shadow-sm">Create Account</h1>
            <p className="text-gray-600 text-sm max-w-sm">Join us today and start your journey to financial freedom</p>
          </div>
        </motion.div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 ${errors.name ? "border-red-500" : "border-green-200"} bg-white/50 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-base shadow-sm hover:shadow-md`}
                placeholder="John Doe"
                disabled={isLoading}
              />
            </div>
            {errors.name && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="text-red-500 text-xs mt-1"
              >
                {errors.name}
              </motion.p>
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 ${errors.email ? "border-red-500" : "border-green-200"} bg-white/50 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-base shadow-sm hover:shadow-md`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 ${errors.phoneNumber ? "border-red-500" : "border-green-200"} bg-white/50 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-base shadow-sm hover:shadow-md`}
                placeholder="1234567890"
                disabled={isLoading}
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 ${errors.password ? "border-red-500" : "border-green-200"} bg-white/50 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-base shadow-sm hover:shadow-md`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-4 rounded-xl border-2 ${errors.confirmPassword ? "border-red-500" : "border-green-200"} bg-white/50 focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-base shadow-sm hover:shadow-md`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </motion.div>
          <motion.div 
            className="flex items-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-primary-color border-gray-300 rounded focus:ring-primary-color disabled:opacity-50 peer"
                disabled={isLoading}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: formData.agreeToTerms ? 1 : 0 }}
                className="absolute inset-0 bg-primary-color/10 rounded pointer-events-none"
              />
            </div>
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-600 select-none">
              I agree to the{" "}
              <Link to="/terms" className="text-primary-color hover:text-green-600 transition-colors duration-200 font-medium">
                Terms and Conditions
              </Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-primary-color hover:text-green-600 transition-colors duration-200 font-medium">
                Privacy Policy
              </Link>
            </label>
          </motion.div>
          {errors.agreeToTerms && (
            <p className="text-red-500 text-xs mt-1 ml-6">{errors.agreeToTerms}</p>
          )}
          {errors.submit && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{errors.submit}</p>
          )}
          {/* Password Strength Indicator */}
          {formData.password && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-green-50 p-4 rounded-lg border border-green-100"
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
                <div className="text-xs text-gray-500">
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

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-0.5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin"
                />
                <span>Creating Account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </motion.button>

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full flex justify-center py-3 px-4 border-2 border-red-100 rounded-xl shadow-lg shadow-red-500/10 bg-gradient-to-b from-white to-red-50 hover:to-red-100 transition-all duration-200"
                onClick={() => toast.error('Google sign up coming soon!')}
              >
                <FaGoogle className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">Google</div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full flex justify-center py-3 px-4 border-2 border-blue-100 rounded-xl shadow-lg shadow-blue-500/10 bg-gradient-to-b from-white to-blue-50 hover:to-blue-100 transition-all duration-200"
                onClick={() => toast.error('Facebook sign up coming soon!')}
              >
                <FaFacebook className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">Facebook</div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full flex justify-center py-3 px-4 border-2 border-sky-100 rounded-xl shadow-lg shadow-sky-500/10 bg-gradient-to-b from-white to-sky-50 hover:to-sky-100 transition-all duration-200"
                onClick={() => toast.error('Twitter sign up coming soon!')}
              >
                <FaTwitter className="h-6 w-6 text-sky-500 group-hover:scale-110 transition-transform duration-200" />
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">Twitter</div>
              </motion.button>
            </div>
          </div>
        </form>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-gray-600 mt-6"
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-color hover:text-green-600 transition-colors duration-200 font-medium"
          >
            Sign in
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;