import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, loading, forgotPassword, error } = useAuth();
  
  // State management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [formError, setFormError] = useState("");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      const action = showRegister ? register : login;
      const result = await action({ email, password }, rememberMe);
      if (result.success) {
        navigate(showRegister ? "/login" : "/dashboard");
      } else {
        setFormError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error(`${showRegister ? "Registration" : "Login"} error:`, error);
      setFormError("An error occurred. Please try again.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setFormError("Please enter your email address");
      return;
    }
    try {
      await forgotPassword(email);
      setFormError("");
      alert("Password reset instructions sent to your email");
    } catch (error) {
      console.error("Forgot password error:", error);
      setFormError("Failed to send password reset instructions");
    }
  };

  const handleSocialLogin = async (provider) => {
    console.log("Social login attempt:", { provider });
    setFormError("");
    alert("Social login is under development");
  };

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-6 font-inter"
      >
        <div className="text-center">
          <motion.h2
            className="text-3xl font-bold text-gray-900 font-poppins"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {showRegister ? "Create Account" : "Welcome Back"}
          </motion.h2>
          <p className="mt-2 text-gray-600 text-sm">
            {showRegister ? "Join our learning platform" : "Access your learning journey"}
          </p>
        </div>

        <AnimatePresence>
          {(error || formError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
            >
              {error || formError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={inputVariants} initial="hidden" animate="visible">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative mt-1">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400 text-gray-900"
                placeholder="you@example.com"
              />
            </div>
          </motion.div>

          <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-gray-400 text-gray-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </motion.div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowSocial(!showSocial)}
              className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
              {showSocial ? "Use Email" : "Social Login"}
            </button>
          </div>

          <AnimatePresence>
            {showSocial ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">Or sign in with</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    className="flex items-center justify-center py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <FaGoogle className="w-5 h-5 text-red-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("facebook")}
                    className="flex items-center justify-center py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <FaFacebook className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("twitter")}
                    className="flex items-center justify-center py-2 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    <FaTwitter className="w-5 h-5 text-blue-400" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium text-sm hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </div>
            ) : showRegister ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        <div className="text-center text-sm text-gray-600">
          {showRegister ? "Already have an account?" : "Need an account?"}
          <button
            type="button"
            onClick={() => setShowRegister(!showRegister)}
            className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            {showRegister ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;