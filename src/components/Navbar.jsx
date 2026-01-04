import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { logoUrl, centerName } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {logoUrl ? (
              <img src={logoUrl} alt={centerName || 'Logo'} className="h-10 object-contain" />
            ) : (
              <h1 className="text-xl font-semibold text-gray-800">
                {centerName || 'Admin Panel'}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User size={20} className="text-gray-500" />
              <span className="text-sm text-gray-700">
                {user?.name || 'Admin'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 