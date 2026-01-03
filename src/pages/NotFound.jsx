import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 pt-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-green-50'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        {/* 404 Animation */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
            >
              404
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-8 -right-8 text-6xl"
            >
              🔍
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Page Not Found
          </h1>
          <p className={`text-lg mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            It might have been moved or deleted.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
            }`}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Home size={20} />
            Go Home
          </button>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`mt-12 p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Quick Links
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Dashboard', path: '/dashboard', icon: '📊' },
              { label: 'Profile', path: '/dashboard/profile', icon: '👤' },
              { label: 'Wallet', path: '/dashboard/wallet', icon: '💰' },
              { label: 'Support', path: '/dashboard/support', icon: '💬' }
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`p-3 rounded-lg transition-all hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-1">{link.icon}</div>
                <div className="text-sm font-medium">{link.label}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`mt-8 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
        >
          Need help? Contact our{' '}
          <button
            onClick={() => navigate('/dashboard/support')}
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            support team
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotFound;
