import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Clock, MousePointer, Copy, Flag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { supabase } from '../../config/supabase';

const ProctoringReport = ({ attemptId, onClose, isDarkMode }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [attemptId]);

  const fetchReport = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/proctoring/report/${attemptId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch proctoring report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!report?.session) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Shield size={48} className="mx-auto mb-4 opacity-50" />
        <p>No proctoring data available for this attempt.</p>
      </div>
    );
  }

  const { session, violations } = report;

  const getRiskColor = (level) => {
    const colors = {
      LOW: isDarkMode ? 'text-green-400 bg-green-900/20' : 'text-green-700 bg-green-50',
      MEDIUM: isDarkMode ? 'text-yellow-400 bg-yellow-900/20' : 'text-yellow-700 bg-yellow-50',
      HIGH: isDarkMode ? 'text-orange-400 bg-orange-900/20' : 'text-orange-700 bg-orange-50',
      CRITICAL: isDarkMode ? 'text-red-400 bg-red-900/20' : 'text-red-700 bg-red-50'
    };
    return colors[level] || colors.LOW;
  };

  const violationTypes = violations.reduce((acc, v) => {
    acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
    return acc;
  }, {});

  const violationIcons = {
    TAB_SWITCH: MousePointer,
    COPY_ATTEMPT: Copy,
    FOCUS_LOSS: Eye,
    RIGHT_CLICK: Flag,
    FULLSCREEN_EXIT: AlertTriangle
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 border-b ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={24} className="text-green-600" />
              <h2 className="text-xl font-bold">Proctoring Report</h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Risk Score */}
        <div className="p-6 space-y-6">
          <div className={`p-6 rounded-xl ${getRiskColor(session.risk_level)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">Risk Level</p>
                <p className="text-3xl font-bold">{session.risk_level}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium opacity-75">Risk Score</p>
                <p className="text-3xl font-bold">{session.risk_score}/100</p>
              </div>
            </div>
          </div>

          {/* Violation Summary */}
          <div>
            <h3 className="font-bold mb-4">Violation Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(violationTypes).map(([type, count]) => {
                const Icon = violationIcons[type] || Flag;
                return (
                  <div
                    key={type}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Icon size={20} className="mb-2 text-orange-500" />
                    <p className="text-xs opacity-75">{type.replace(/_/g, ' ')}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-bold mb-4">Activity Timeline</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {violations.map((v, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-l-4 ${
                    v.severity >= 4
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                  } ${isDarkMode ? 'bg-opacity-10' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {React.createElement(violationIcons[v.violation_type] || Flag, { size: 16 })}
                      <span className="font-medium text-sm">
                        {v.violation_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-xs opacity-75">
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {v.metadata?.duration && (
                    <p className="text-xs mt-1 opacity-75">
                      Duration: {Math.round(v.metadata.duration / 1000)}s
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Device Info */}
          {session.device_fingerprint && (
            <div>
              <h3 className="font-bold mb-4">Device Information</h3>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="opacity-75">Browser</p>
                    <p className="font-medium">{session.device_fingerprint.userAgent?.split(' ')[0] || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="opacity-75">Platform</p>
                    <p className="font-medium">{session.device_fingerprint.platform || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="opacity-75">Screen</p>
                    <p className="font-medium">{session.device_fingerprint.screenResolution || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="opacity-75">Timezone</p>
                    <p className="font-medium">{session.device_fingerprint.timezone || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProctoringReport;
