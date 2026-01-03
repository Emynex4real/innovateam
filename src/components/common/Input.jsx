import React, { forwardRef } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  error,
  touched,
  required,
  className = '',
  containerClassName = '',
  labelClassName = '',
  helpText,
  ...props
}, ref) => {
  const inputId = `input-${name}`;
  const errorId = `error-${name}`;
  const helpTextId = `help-${name}`;
  const hasError = touched && error;

  return (
    <div className={`relative ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          className={`
            block w-full rounded-md border-gray-300 shadow-sm
            focus:border-primary-500 focus:ring-primary-500 sm:text-sm
            ${hasError ? 'border-red-300 pr-10 text-red-900 placeholder-red-300' : ''}
            ${className}
          `}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={`${hasError ? errorId : ''} ${helpText ? helpTextId : ''}`}
          {...props}
        />
        {hasError && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {helpText && !hasError && (
        <p
          id={helpTextId}
          className="mt-1 text-sm text-gray-500"
        >
          {helpText}
        </p>
      )}
      {hasError && (
        <p
          id={errorId}
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 