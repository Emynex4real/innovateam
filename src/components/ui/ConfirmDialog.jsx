import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from './button';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // 'warning', 'success', 'info'
}) => {
  if (!isOpen) return null;

  const icons = {
    warning: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    info: <AlertCircle className="w-12 h-12 text-blue-500" />
  };

  const colors = {
    warning: 'bg-yellow-50 border-yellow-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="p-6">
            <div className={`w-16 h-16 rounded-full ${colors[type]} border-2 flex items-center justify-center mx-auto mb-4`}>
              {icons[type]}
            </div>

            <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">
              {title}
            </h3>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                {cancelText}
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
