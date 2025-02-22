import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Enter a valid phone number (10-15 digits)';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual signup logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Sign up successful:', formData);
      navigate('/login'); // Redirect to login after signup
    } catch (error) {
      setErrors({ submit: 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-nunito">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-color">Create Account</h1>
          <p className="text-gray-600 mt-2 text-sm">Join us today</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-md border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 text-sm`}
              placeholder="John Doe"
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-md border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 text-sm`}
              placeholder="you@example.com"
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-md border ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 text-sm`}
              placeholder="1234567890"
              disabled={isLoading}
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-md border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 text-sm`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-md border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 text-sm`}
              placeholder="••••••••"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-primary-color border-gray-300 rounded focus:ring-primary-color disabled:opacity-50"
              disabled={isLoading}
            />
            <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-color hover:text-green-600">
                Terms and Conditions
              </Link>
            </label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-red-500 text-xs mt-1 ml-6">{errors.agreeToTerms}</p>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{errors.submit}</p>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full bg-primary-color text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-color font-semibold hover:text-green-600 transition-colors duration-200">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;