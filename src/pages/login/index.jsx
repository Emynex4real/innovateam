import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiHome, FiArrowLeft } from "react-icons/fi";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [formError, setFormError] = useState("");

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      const result = await login({ email, password }, rememberMe);
      if (result.success) {
        setEmail("");
        setPassword("");
        setRememberMe(false);
        navigate("/dashboard");
      } else {
        toast.error(result.error?.response?.data?.message || "Invalid credentials");
        setFormError(result.error?.response?.data?.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
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
      const result = await forgotPassword(email);
      if (result.success) {
        setFormError("");
        toast.success("Password reset instructions sent to your email");
      } else {
        setFormError(result.error?.response?.data?.message || "Failed to send password reset instructions");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setFormError("Failed to send password reset instructions");
    }
  };

  const handleSocialLogin = async (provider) => {
    console.log("Social login attempt:", { provider });
    setFormError("");
    toast.info("Social login is coming soon!");
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-color/10 via-white to-gray-50 flex items-center justify-center p-4 relative">
      <Link 
        to="/" 
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-600 hover:text-primary-color transition-colors duration-200"
      >
        <FiArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 font-inter backdrop-blur-sm bg-white/90 border border-white/20"
      >
        <div className="text-center">
          <motion.h2
            className="text-3xl font-bold text-gray-900 font-poppins"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Welcome Back
          </motion.h2>
          <p className="mt-2 text-gray-600 text-sm">Access your learning journey</p>
        </div>

        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md"
            >
              {formError}
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
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-color focus:border-primary-color transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white/50"
                placeholder="you@example.com"
                disabled={loading}
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
                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-color focus:border-primary-color transition-all duration-200 placeholder-gray-400 text-gray-900 bg-white/50"
                placeholder="••••••••"
                disabled={loading}
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
                className="h-4 w-4 text-primary-color focus:ring-primary-color border-gray-300 rounded"
                disabled={loading}
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
                <div className="text-center space-y-4">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-primary-color hover:text-green-600 transition-colors duration-200"
                  >
                    Forgot your password?
                  </button>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <span>Don't have an account?</span>
                    <Link to="/signup" className="text-primary-color hover:text-green-600 transition-colors duration-200 font-medium">
                      Sign up
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary-color hover:bg-green-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </motion.button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Need an account?{" "}
          <Link
            to="/register"
            className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
          >
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;