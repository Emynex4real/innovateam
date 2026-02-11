import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Search, ChevronRight } from 'lucide-react';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const JoinCenter = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (code.length < 6) return;
    
    setLoading(true);
    try {
      const res = await studentTCService.joinCenter(code.toUpperCase());
      
      if (res.success) {
        toast.success(`Welcome to ${res.center.name}! 🎉`);
        
        setTimeout(() => {
          navigate('/student/dashboard', { replace: true });
        }, 100);
      } else {
        console.error('Join failed', res);
        toast.error(res.message || 'Failed to join center');
        setLoading(false);
      }
    } catch (error) {
      console.error('Join error', error);
      toast.error(error.response?.data?.error || 'Invalid code');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Back Button */}
      <div className="w-full max-w-md mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className={`w-full max-w-md rounded-2xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
        
        {/* Header Section */}
        <div className={`px-8 pt-10 pb-6 text-center border-b ${isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-50 bg-white'}`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Key size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Join a Center</h1>
          <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
            Enter the 6-character access code provided by your instructor.
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleJoin}>
            <div className="mb-8">
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 text-center ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
                Access Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC-123"
                className={`w-full text-center text-4xl font-mono font-bold tracking-widest py-3 bg-transparent border-b-2 outline-none transition-all placeholder-opacity-30 ${
                  isDarkMode 
                    ? 'border-zinc-700 focus:border-indigo-500 text-white placeholder-zinc-700' 
                    : 'border-gray-200 focus:border-indigo-600 text-gray-900 placeholder-gray-300'
                }`}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={code.length < 6 || loading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isDarkMode 
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-zinc-800 disabled:text-zinc-600' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-200 disabled:text-gray-400'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Join Center <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <div className={`p-4 text-center border-t ${isDarkMode ? 'bg-zinc-950/30 border-zinc-800' : 'bg-gray-50 border-gray-100'}`}>
          <button 
            onClick={() => navigate('/student/tests/public')}
            className={`text-xs font-medium flex items-center justify-center gap-1.5 mx-auto transition-colors ${
              isDarkMode ? 'text-zinc-500 hover:text-indigo-400' : 'text-gray-500 hover:text-indigo-600'
            }`}
          >
            <Search size={14} /> Looking for public tests? Browse Library
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCenter;