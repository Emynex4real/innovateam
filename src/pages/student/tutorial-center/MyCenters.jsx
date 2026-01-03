import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Plus, Globe, Users, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import studentTCService from '../../../services/studentTC.service';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const MyCenters = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const response = await studentTCService.getMyCenters();
      if (response.success) setCenters(response.centers || []);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to load centers';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Centers</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your enrollments and access private tests</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => navigate('/student/tests/public')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Globe size={18} /> Public Tests
            </button>
            <button 
              onClick={() => navigate('/student/centers/join')}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              <Plus size={18} /> Join New
            </button>
          </div>
        </div>

        {/* Centers Grid */}
        {centers.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="text-blue-500" size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Centers Yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">Join a tutorial center to access exclusive content and tracking.</p>
            <button onClick={() => navigate('/student/centers/join')} className="text-blue-600 font-bold hover:underline">Join your first center &rarr;</button>
          </motion.div>
        ) : (
          <motion.div 
            variants={container} initial="hidden" animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {centers.map((center) => (
              <motion.div
                key={center.id} variants={item}
                onClick={() => navigate(`/student/tests?center=${center.id}`)}
                className="group bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer hover:shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <GraduationCap size={120} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600 dark:text-blue-400">
                      <GraduationCap size={24} />
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                      Active
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{center.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                    {center.description || "A place for excellence and learning."}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Users size={16} />
                      <span>{center.tutor_name || 'Tutor'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar size={16} />
                      <span>Joined {new Date(center.enrolled_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:gap-2 transition-all">
                    View Tests <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyCenters;