import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <div>
    <div className="bg-gradient-to-r from-green-300 to-green-500 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Create your Account
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter your details to register
        </p>

        {/* Name Input */}
        <div className="relative mb-6">
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 peer"
            placeholder=" "
          />
          <label
            htmlFor="name"
            className="absolute left-4 top-2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:text-sm peer-focus:text-green-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-green-500 bg-white px-1"
          >
            Name
          </label>
        </div>

        {/* Email Input */}
        <div className="relative mb-6">
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 peer"
            placeholder=" "
          />
          <label
            htmlFor="email"
            className="absolute left-4 top-2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:text-sm peer-focus:text-green-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-green-500 bg-white px-1"
          >
            Email
          </label>
        </div>

        {/* Phone Number Input */}
        <div className="relative mb-6">
          <input
            type="number"
            id="number"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 peer appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-appearance:textfield] p-2"
            placeholder=" "
          />
          <label
            htmlFor="number"
            className="absolute left-4 top-2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:text-sm peer-focus:text-green-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-green-500 bg-white px-1"
          >
            Phone Number
          </label>
        </div>

        {/* Password Input */}
        <div className="relative mb-6">
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 peer"
            placeholder=" "
          />
          <label
            htmlFor="password"
            className="absolute left-4 top-2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:text-sm peer-focus:text-green-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-green-500 bg-white px-1"
          >
            Password
          </label>
        </div>

        {/* Confirm Password Input */}
        <div className="relative mb-6">
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 peer"
            placeholder=" "
          />
          <label
            htmlFor="confirmPassword"
            className="absolute left-4 top-2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:-top-3 peer-focus:text-sm peer-focus:text-green-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-[&:not(:placeholder-shown)]:-top-3 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-green-500 bg-white px-1"
          >
            Confirm Password
          </label>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input type="checkbox" id="terms-and-conditions" className="mr-2" />
            <label htmlFor="terms-and-conditions" className="text-gray-600 text-xs">
              I agree with the terms and conditions
            </label>
          </div>
          <a href="#" className="text-green-500 hover:text-green-700 text-sm">
            Forgot Password?
          </a>
        </div>

        {/* Sign Up Button */}
        <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-300">
          Sign Up
        </button>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to={'/login'} className="text-green-500 hover:text-green-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default SignUp;
