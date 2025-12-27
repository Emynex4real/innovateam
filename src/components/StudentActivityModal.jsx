import React from 'react';
import { motion } from 'framer-motion';
import { componentStyles } from '../styles/designSystem';

const StudentActivityModal = ({ activity, onClose }) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className={componentStyles.card.default + ' max-w-2xl w-full max-h-[90vh] overflow-y-auto'}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Test Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{activity.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-mono text-sm text-gray-700">{activity.studentId?.slice(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Test Info */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Test Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Test Title</p>
                <p className="font-medium text-gray-900">{activity.testTitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Score</p>
                  <p className={`text-2xl font-bold ${activity.passed ? 'text-green-600' : 'text-orange-600'}`}>
                    {activity.score}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    activity.passed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {activity.passed ? 'Passed ✓' : 'Failed'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed At</p>
                <p className="text-gray-900">{new Date(activity.completedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {activity.integrityScore && (
            <div className={`rounded-lg p-4 ${
              activity.integrityScore >= 80 ? 'bg-green-50' : 
              activity.integrityScore >= 60 ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <h3 className="font-semibold text-gray-900 mb-3">Integrity Score</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      activity.integrityScore >= 80 ? 'bg-green-600' : 
                      activity.integrityScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${activity.integrityScore}%` }}
                  />
                </div>
                <span className="font-bold text-gray-900">{activity.integrityScore}%</span>
              </div>
            </div>
          )}

          {activity.suspiciousEvents && activity.suspiciousEvents.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h3 className="font-semibold text-red-800 mb-3">⚠️ Suspicious Activity Detected</h3>
              <ul className="space-y-2">
                {activity.suspiciousEvents.map((event, idx) => (
                  <li key={idx} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-500">•</span>
                    <span>{event.type.replace('_', ' ')}: {event.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className={componentStyles.button.secondary + ' flex-1'}>
            Close
          </button>
          <button 
            onClick={() => window.location.href = `/tutor/students/${activity.studentId}`}
            className={componentStyles.button.primary + ' flex-1'}
          >
            View Full Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentActivityModal;
