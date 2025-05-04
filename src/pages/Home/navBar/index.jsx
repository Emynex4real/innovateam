import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const NavBar = () => {
  return (
    <nav className="py-4 px-6 bg-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-learnify-orange">
          Learnify
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex items-center">
            <span className="mr-1">Subjects</span>
            <ChevronDown size={16} />
          </div>
          <div className="flex items-center">
            <span className="mr-1">Courses</span>
            <ChevronDown size={16} />
          </div>
          <Link to="/degrees">Degrees</Link>
          <Link to="/business">For business</Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            to="/signup" 
            className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium"
          >
            Sign up
          </Link>
          <Link 
            to="/login" 
            className="px-5 py-2 bg-learnify-orange text-white rounded-lg text-sm font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;