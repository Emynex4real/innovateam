import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ERROR_MESSAGES } from '../config/constants';

const useApi = (apiFunc, options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    errorMessage = ERROR_MESSAGES.GENERIC,
  } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunc(...params);
      setData(response.data);
      
      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || errorMessage;
      setError(errorMsg);
      
      if (showErrorToast) {
        toast.error(errorMsg);
      }
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [apiFunc, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    loading,
    execute,
    reset,
  };
};

export default useApi; 