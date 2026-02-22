import React from 'react';
import { Shield, AlertTriangle, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProctoringMonitor = ({ violations, isDarkMode }) => {
  const violationCount = violations.length;
  
  const getRiskLevel = () => {
    if (violationCount >= 20) return { level: 'CRITICAL', color: 'red', text: 'Critical' };
    if (violationCount >= 10) return { level: 'HIGH', color: 'orange', text: 'High' };
    if (violationCount >= 5) return { level: 'MEDIUM', color: 'yellow', text: 'Medium' };
    return { level: 'LOW', color: 'green', text: 'Low' };
  };

  const risk = getRiskLevel();

  const colorClasses = {
    green: isDarkMode 
      ? 'bg-green-900/20 border-green-800 text-green-400' 
      : 'bg-green-50 border-green-200 text-green-700',
    yellow: isDarkMode 
      ? 'bg-yellow-900/20 border-yellow-800 text-yellow-400' 
      : 'bg-yellow-50 border-yellow-200 text-yellow-700',
    orange: isDarkMode 
      ? 'bg-orange-900/20 border-orange-800 text-orange-400' 
      : 'bg-orange-50 border-orange-200 text-orange-700',
    red: isDarkMode 
      ? 'bg-red-900/20 border-red-800 text-red-400' 
      : 'bg-red-50 border-red-200 text-red-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-20 right-4 z-30 px-4 py-3 rounded-xl border-2 shadow-lg backdrop-blur-sm ${colorClasses[risk.color]}`}
    >
      <div className="flex items-center gap-3">
        <Eye size={18} />
        <div>
          <p className="text-xs font-medium opacity-75">Proctoring Active</p>
          <p className="text-sm font-bold">
            {violationCount} {violationCount === 1 ? 'Flag' : 'Flags'}
            <span className="ml-2 text-xs">({risk.text})</span>
          </p>
        </div>
      </div>

      <AnimatePresence>
        {violationCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 pt-2 border-t border-current/20"
          >
            <p className="text-xs opacity-75">
              Your activity is being monitored. Avoid switching tabs or copying content.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProctoringMonitor;
