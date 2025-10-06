const { logger } = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, details = null, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  // Ensure we have a request ID (from our middleware or generate one)
  const requestId = req.requestId || Math.random().toString(36).substring(2, 10);
  
  // Log the error with request details
  const errorDetails = {
    timestamp: new Date().toISOString(),
    requestId: requestId,
    path: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'] || req.connection.remoteAddress
    },
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code || err.statusCode || 500,
      status: err.status,
      details: err.details,
      // Include all enumerable properties of the error object
      ...Object.getOwnPropertyNames(err).reduce((acc, key) => {
        if (key !== 'stack' && key !== 'message' && key !== 'name') {
          acc[key] = err[key];
        }
        return acc;
      }, {})
    }
  };
  
  // Always log the full error to the console for debugging
  console.error(`\n❌ [${requestId}] UNHANDLED ERROR:`, JSON.stringify(errorDetails, null, 2));
  
  // If this is a database error, log additional details
  if (err.code && (err.code.startsWith('22') || err.code.startsWith('23') || err.code.startsWith('42'))) {
    console.error(`🔍 [${requestId}] DATABASE ERROR:`, {
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      position: err.position,
      internalPosition: err.internalPosition,
      internalQuery: err.internalQuery,
      where: err.where,
      schema: err.schema,
      table: err.table,
      column: err.column,
      dataType: err.dataType,
      constraint: err.constraint
    });
  }

  // Log the full error details in development, sanitized in production
  if (process.env.NODE_ENV === 'development') {
    console.error('\n❌ ERROR DETAILS:', JSON.stringify(errorDetails, null, 2));
  } else {
    // In production, log a sanitized version
    const sanitizedError = {
      timestamp: errorDetails.timestamp,
      path: errorDetails.path,
      method: errorDetails.method,
      error: {
        message: errorDetails.error.message,
        name: errorDetails.error.name,
        code: errorDetails.error.code
      }
    };
    console.error('\n❌ ERROR:', JSON.stringify(sanitizedError, null, 2));
  }

  // Determine the status code and response format
  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(err.code && { code: err.code }),
      ...(err.details && { details: err.details }),
      ...(isDevelopment && { 
        stack: err.stack,
        ...(err.errors && { errors: err.errors })
      })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Log to file if logger is configured
  if (logger) {
    logger.error('Request Error', errorDetails);
  }

  // Send the error response
  res.status(statusCode).json(errorResponse);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // You might want to log this to an error tracking service
  // process.exit(1); // Consider whether to exit or not based on your use case
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // You might want to log this to an error tracking service
  // process.exit(1); // Consider whether to exit or not based on your use case
});

module.exports = {
  AppError,
  errorHandler
};