import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/SupabaseAuthContext";
import { useDarkMode } from "../../contexts/DarkModeContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { FaGoogle, FaFacebook, FaTwitter } from "react-icons/fa";
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, loading, resetPassword } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Please fill in all fields");
      return;
    }

    try {
      const result = await signIn(email, password);
      if (result.success) {
        setEmail("");
        setPassword("");
        setRememberMe(false);
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || "Invalid credentials");
        setFormError(result.error || "Invalid credentials");
      }
    } catch (error) {
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
      const result = await resetPassword(email);
      if (result.success) {
        setFormError("");
        toast.success("Password reset instructions sent to your email");
      } else {
        setFormError(result.error || "Failed to send password reset instructions");
      }
    } catch (error) {
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <Card className={isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90'}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Access your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {formError && (
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
                  {formError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    disabled={loading}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-primary-color hover:text-primary-color/80"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className={`w-full ${
                  isDarkMode 
                    ? 'bg-primary-color hover:bg-primary-color/90 text-white' 
                    : 'bg-primary-color hover:bg-primary-color/90 text-white'
                } font-semibold py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary-color/50 disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className={`w-full ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-800 hover:text-white' 
                    : 'border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                } transition-colors duration-200`}
                onClick={() => handleSocialLogin("google")}
                disabled={loading}
              >
                <FaGoogle className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
              </Button>
              <Button
                type="button"
                variant="outline"
                className={`w-full ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-800 hover:text-white' 
                    : 'border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                } transition-colors duration-200`}
                onClick={() => handleSocialLogin("facebook")}
                disabled={loading}
              >
                <FaFacebook className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </Button>
              <Button
                type="button"
                variant="outline"
                className={`w-full ${
                  isDarkMode 
                    ? 'border-gray-700 hover:bg-gray-800 hover:text-white' 
                    : 'border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                } transition-colors duration-200`}
                onClick={() => handleSocialLogin("twitter")}
                disabled={loading}
              >
                <FaTwitter className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <p className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className={`font-medium hover:underline ${
                  isDarkMode 
                    ? 'text-primary-color hover:text-primary-color/80' 
                    : 'text-primary-color hover:text-primary-color/90'
                }`}
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;