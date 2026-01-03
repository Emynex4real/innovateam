/**
 * Custom Error Classes for Gemini Service
 */

class GeminiError extends Error {
  constructor(message, code = 'GEMINI_ERROR', statusCode = 500) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends GeminiError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

class RateLimitError extends GeminiError {
  constructor(message) {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

class CircuitBreakerError extends GeminiError {
  constructor(message) {
    super(message, 'CIRCUIT_BREAKER_OPEN', 503);
    this.name = 'CircuitBreakerError';
  }
}

module.exports = {
  GeminiError,
  ValidationError,
  RateLimitError,
  CircuitBreakerError
};
