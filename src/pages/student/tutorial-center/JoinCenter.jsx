import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Search } from 'lucide-react';
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
        navigate('/student/centers');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
              <Key size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Access Code</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Ask your tutor for the 6-character code to join their center.
            </p>
          </div>

          <form onSubmit={handleJoin}>
            <div className="mb-6">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABC-123"
                className="w-full text-center text-3xl font-mono font-bold tracking-widest py-4 border-b-2 border-gray-200 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-500 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={code.length < 6 || loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {loading ? 'Verifying...' : 'Join Center'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 mb-4">Looking for open tests?</p>
            <button 
              onClick={() => navigate('/student/tests/public')}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors"
            >
              <Search size={16} /> Browse Public Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCenter;