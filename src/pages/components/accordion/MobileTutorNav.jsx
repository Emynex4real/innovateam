import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Settings, Users, PlusCircle } from 'lucide-react';

const MobileTutorNav = () => {
  const location = useLocation();
  
  // Helper to check if the current link is active
  const isActive = (path) => {
    if (path === '/tutor' && location.pathname === '/tutor') return true;
    if (path !== '/tutor' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-2 pb-safe z-50 md:hidden flex justify-around items-center backdrop-blur-lg bg-opacity-95">
      
      {/* Home Tab */}
      <Link 
        to="/tutor" 
        className={`flex flex-col items-center gap-1 p-2 min-w-[60px] ${
          isActive('/tutor') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
        }`}
      >
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>

      {/* Tests Tab */}
      <Link 
        to="/tutor/tests" 
        className={`flex flex-col items-center gap-1 p-2 min-w-[60px] ${
          isActive('/tutor/tests') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
        }`}
      >
        <FileText className="w-6 h-6" />
        <span className="text-[10px] font-medium">Tests</span>
      </Link>

      {/* Center "Generate" Button (Floating) */}
      <div className="relative -top-6">
        <Link to="/tutor/questions/generate">
          <div className="bg-blue-600 text-white p-3.5 rounded-full shadow-lg shadow-blue-500/30 border-4 border-slate-50 dark:border-slate-950 active:scale-95 transition-transform">
            <PlusCircle className="w-7 h-7" />
          </div>
        </Link>
      </div>

      {/* Bank Tab */}
      <Link 
        to="/tutor/questions" 
        className={`flex flex-col items-center gap-1 p-2 min-w-[60px] ${
          isActive('/tutor/questions') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
        }`}
      >
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-medium">Bank</span>
      </Link>

      {/* Students Tab */}
      <Link 
        to="/tutor/students" 
        className={`flex flex-col items-center gap-1 p-2 min-w-[60px] ${
          isActive('/tutor/students') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
        }`}
      >
        <Users className="w-6 h-6" />
        <span className="text-[10px] font-medium">Students</span>
      </Link>

    </div>
  );
};

export default MobileTutorNav;