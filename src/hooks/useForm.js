import { useState, useCallback } from 'react';

const useForm = (initialValues = {}, validate = () => ({})) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    const validationErrors = validate(values);
    if (validationErrors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: validationErrors[name]
      }));
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async (onSubmit) => {
    try {
      setIsSubmitting(true);
      const validationErrors = validate(values);
      setErrors(validationErrors);

      // Mark all fields as touched on submit
      const touchedFields = Object.keys(values).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {});
      setTouched(touchedFields);

      if (Object.keys(validationErrors).length === 0) {
        await onSubmit(values);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError
  };
};

export default useForm; 