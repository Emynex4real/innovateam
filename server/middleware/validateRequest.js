const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw new AppError(errorMessages.join(', '), 400);
  }
  next();
}; 