import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Optional: Add an image for the 404 page (e.g., a "lost" illustration)
import notFoundImage from "../../images/error.png"; // You can add an image in src/assets/

const NotFound = () => {
  // Animation variants for the main content
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // Animation for the image
  const imageVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  // Animation for the button
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-nunito">
      {/* Main Content with Animation */}
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 404 Illustration (Optional) */}
        <motion.img
          src={notFoundImage}
          alt="404 Not Found"
          className="w-64 h-64 mx-auto mb-8"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        />

        {/* 404 Heading */}
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>

        {/* Error Message */}
        <h2 className="text-3xl font-semibold text-gray-600 mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg text-gray-500 mb-8 max-w-md">
          The page you’re looking for doesn’t exist or has been moved. Let’s get
          you back on track!
        </p>

        {/* Back to Home Button */}
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          className="inline-block"
        >
          <Link
            to="/"
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-blue-800 transition-all duration-300"
          >
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full opacity-20 translate-x-1/2 translate-y-1/2" />
      </div>
    </div>
  );
};

export default NotFound;
