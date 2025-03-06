import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (!storedUser) {
        throw new Error("No account exists. Please sign up first.");
      }

      if (storedUser.email === email && storedUser.password === password) {
        login(); // Update auth state
        navigate("/homepage");
      } else {
        throw new Error("Invalid email or password.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    console.log(`Logging in with ${provider}`);
    setTimeout(() => setIsLoading(false), 1000);
    setError("Social login not available yet.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 font-nunito">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-color">Welcome Back</h1>
          <p className="text-gray-600 mt-2 text-sm">Sign in to your account</p>
        </div>
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-sm animate-fade-in-up">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 text-primary-color border-gray-300 rounded focus:ring-primary-color disabled:opacity-50"
                disabled={isLoading}
              />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-primary-color hover:text-green-600 transition-colors duration-200">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-primary-color text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : null}
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="mx-4 text-sm text-gray-500">or continue with</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSocialLogin("Facebook")}
            className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
          <button
            onClick={() => handleSocialLogin("Google")}
            className="flex items-center justify-center py-2 px-4 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed text-sm"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
              <path d="M21.805 10.023H12.43v4.007h5.33c-.24 1.29-.96 2.4-2.04 3.24v2.64h3.36c1.96-1.8 3.12-4.44 3.12-7.56 0-.72-.12-1.44-.4-2.04zm-17.52 0v4.007h3.36v-4.007H4.285zm0-4.008V10.02h3.36V6.015H4.285zm8.145-2.004H20.5c1.2 0 2.28.36 3.12.96v-.96c0-2.76-2.28-5.04-5.04-5.04h-6.15V3.01z" fill="#4285F4" />
              <path d="M12.43 20.99c2.76 0 5.04-1.8 5.88-4.2h-5.88v-4.007h9.36c.12.36.24.72.24 1.08 0 4.44-3 7.56-7.56 7.56-4.44 0-8.04-3.6-8.04-8.04s3.6-8.04 8.04-8.04c1.92 0 3.6.72 4.92 1.92l2.88-2.88C18.97 1.33 16.09 0 12.43 0 5.95 0 1.33 4.62 1.33 11.11s4.62 11.11 11.1 11.11z" fill="#34A853" />
              <path d="M6.645 6.015V10.02h3.36V6.015H6.645z" fill="#FBBC05" />
              <path d="M12.43 16.983h5.88c-.84 2.4-3.12 4.2-5.88 4.2-4.44 0-8.04-3.6-8.04-8.04H1.33c0 6.48 4.62 11.11 11.1 11.11 2.88 0 5.52-1.08 7.56-2.88l-3.36-2.64c-1.08.84-2.4 1.44-3.6 1.44z" fill="#EA4335" />
            </svg>
            Google
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-primary-color font-semibold hover:text-green-600 transition-colors duration-200">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;