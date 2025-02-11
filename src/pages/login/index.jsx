import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div>
      <div className="bg-gradient-to-r from-green-300 to-green-500 flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Login to Your Account
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Enter your username & password to login
          </p>

          {/* <!-- Email Input --> */}
          <div className="relative mb-6">
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 peer"
              placeholder=" "
            />
            <label
              for="email"
              className="absolute left-4 top-2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:text-sm peer-focus:text-green-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-green-500 bg-white px-1"
            >
              Email
            </label>
          </div>

          {/* <!-- Password Input --> */}
          <div className="relative mb-6">
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 peer"
              placeholder=" "
            />
            <label
              for="password"
              className="absolute left-4 top-2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:text-sm peer-focus:text-green-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-green-500 bg-white px-1"
            >
              Password
            </label>
          </div>

          {/* <!-- Remember Me & Forgot Password --> */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2" />
              <label for="remember" className="text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" className="text-green-500 hover:text-green-700">
              Forgot Password?
            </a>
          </div>

          {/* <!-- Login Button --> */}
          <Link to={'/homepage'}>
          <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-300">
            Login
          </button>
          
          </Link>

          {/* <!-- Social Login --> */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">Or login with</p>
            <div className="flex justify-center space-x-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300">
                Facebook
              </button>
              
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300">
                Google
              </button>
            </div>
          </div>

          {/* <!-- Create Account Link --> */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to={'/signup'} className="text-green-500 hover:text-green-700">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
