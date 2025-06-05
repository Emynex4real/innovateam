import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { useDarkMode } from "../../contexts/DarkModeContext";
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import Button from "../../components/ui/button";
import Input from "../../components/ui/input";
import Label from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";

const Register = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { isDarkMode } = useDarkMode();

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
      console.log('Attempting registration with:', { ...formData, password: '[REDACTED]' });
      const result = await authRegister(formData);
      console.log('Registration result:', result);
      
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
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to create account';
        console.error('Registration failed:', errorMessage);
        setErrors({ submit: errorMessage });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error?.response?.data?.message || 
                          (typeof error === 'string' ? error : error?.message) || 
                          "Failed to create account. Please try again.";
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
        className="w-full max-w-md"
      >
        <Card className={isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90'}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Join us and start your journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <AnimatePresence>
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 text-sm rounded-md ${
                    isDarkMode 
                      ? 'bg-red-900/50 border border-red-800 text-red-200' 
                      : 'bg-red-50 border border-red-200 text-red-600'
                  }`}
                >
                  {errors.submit}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="1234567890"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {formData.password && (
                <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}>
                  <CardContent className="space-y-2">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, index) => (
                        <div 
                          key={index}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${getStrengthColor(index, passwordStrength)}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-medium ${getStrengthTextColor(passwordStrength)}`}>
                        {passwordStrength === 0 && 'Very Weak'}
                        {passwordStrength === 1 && 'Weak'}
                        {passwordStrength === 2 && 'Medium'}
                        {passwordStrength === 3 && 'Strong'}
                        {passwordStrength === 4 && 'Very Strong'}
                      </p>
                      {passwordStrength < 4 && (
                        <ul className={`text-xs space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {!/.{8,}/.test(formData.password) && <li>• At least 8 characters</li>}
                          {!/[A-Z]/.test(formData.password) && <li>• One uppercase letter</li>}
                          {!/[0-9]/.test(formData.password) && <li>• One number</li>}
                          {!/[^A-Za-z0-9]/.test(formData.password) && <li>• One special character</li>}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      handleChange({ target: { name: 'agreeToTerms', type: 'checkbox', checked } })
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className={`font-medium ${
                        isDarkMode 
                          ? 'text-primary-color hover:text-primary-color/80' 
                          : 'text-primary-color hover:text-primary-color/90'
                      }`}
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className={`font-medium ${
                        isDarkMode 
                          ? 'text-primary-color hover:text-primary-color/80' 
                          : 'text-primary-color hover:text-primary-color/90'
                      }`}
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${
                    isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                  }`}>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toast.error('Google sign up coming soon!')}
                >
                  <FaGoogle className="w-5 h-5 text-red-500" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toast.error('Facebook sign up coming soon!')}
                >
                  <FaFacebook className="w-5 h-5 text-blue-600" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toast.error('Twitter sign up coming soon!')}
                >
                  <FaTwitter className="w-5 h-5 text-blue-400" />
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <div className="w-full text-center text-sm">
              Already have an account?{' '}
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
          </CardFooter>
        </Card>
      </motion.div>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
    </div>
  );
};

export default Register;