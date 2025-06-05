import React from 'react';
import { render } from '@testing-library/react';
import { toast } from 'react-toastify';
import errorHandler from './errorHandler';
import { ERROR_MESSAGES } from '../config/constants';
import { logger } from '../services/logger.service';

// Mock react-toastify
jest.mock('react-toastify');
jest.mock('../services/logger.service', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('ErrorHandler', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    toast.error.mockClear();
    logger.error.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('handles basic errors', () => {
    const error = new Error('Test error');
    errorHandler.handleError(error);

    expect(logger.error).toHaveBeenCalledWith('Error caught by error handler:', expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith('Test error');
  });

  it('handles axios errors', () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {
          message: 'Resource not found',
        },
      },
    };

    errorHandler.handleError(axiosError);
    expect(toast.error).toHaveBeenCalledWith(ERROR_MESSAGES.NOT_FOUND);
  });

  it('handles network errors', () => {
    const networkError = {
      isAxiosError: true,
      response: null,
    };

    errorHandler.handleError(networkError);
    expect(toast.error).toHaveBeenCalledWith(ERROR_MESSAGES.NETWORK_ERROR);
  });

  it('handles validation errors', () => {
    const validationError = {
      name: 'ValidationError',
      message: 'Invalid input',
    };

    errorHandler.handleError(validationError);
    expect(toast.error).toHaveBeenCalledWith('Invalid input');
  });

  it('handles authentication errors', () => {
    const authError = {
      name: 'AuthenticationError',
      message: 'Invalid credentials',
    };

    errorHandler.handleError(authError);
    expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
  });

  it('notifies error listeners', () => {
    const listener = jest.fn();
    const error = new Error('Test error');

    const unsubscribe = errorHandler.addErrorListener(listener);
    errorHandler.handleError(error);

    expect(listener).toHaveBeenCalledWith(error, null);

    unsubscribe();
    errorHandler.handleError(new Error('Another error'));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('handles errors in error listeners', () => {
    const listener = jest.fn().mockImplementation(() => {
      throw new Error('Listener error');
    });

    errorHandler.addErrorListener(listener);
    const error = new Error('Test error');
    errorHandler.handleError(error);

    expect(logger.error).toHaveBeenCalledWith('Error in error listener:', expect.any(Error));
  });

  it('wraps async functions', async () => {
    const asyncFn = jest.fn().mockRejectedValue(new Error('Async error'));
    const wrappedFn = () => errorHandler.wrapAsync(asyncFn());

    await expect(wrappedFn()).rejects.toThrow('Async error');
    expect(logger.error).toHaveBeenCalledWith('Error caught by error handler:', expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith('Async error');
  });

  it('creates error boundaries', () => {
    const error = new Error('Boundary error');
    const errorBoundary = errorHandler.createErrorBoundary();

    errorBoundary.prototype.componentDidCatch.call({}, error, { componentStack: 'stack' });

    expect(logger.error).toHaveBeenCalledWith('Error caught by error handler:', expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith('Boundary error');
  });
}); 