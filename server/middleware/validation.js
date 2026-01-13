const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Question validation rules
const questionValidation = [
  body('question_text')
    .trim()
    .notEmpty().withMessage('Question text is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Question must be 10-1000 characters'),
  body('options')
    .isArray({ min: 2, max: 6 }).withMessage('Must have 2-6 options')
    .custom((options) => {
      if (options.some(opt => !opt || opt.trim().length === 0)) {
        throw new Error('All options must be non-empty');
      }
      return true;
    }),
  body('correct_answer')
    .trim()
    .notEmpty().withMessage('Correct answer is required'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Subject must be max 100 characters'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  validate
];

// Question set validation rules
const questionSetValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be max 1000 characters'),
  body('time_limit')
    .optional()
    .isInt({ min: 1, max: 300 }).withMessage('Time limit must be 1-300 minutes'),
  body('passing_score')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Passing score must be 0-100'),
  body('mode')
    .optional()
    .isIn(['practice', 'exam']).withMessage('Mode must be practice or exam'),
  body('is_active')
    .optional()
    .isBoolean().withMessage('is_active must be a boolean'),
  body('show_answers')
    .optional()
    .isBoolean().withMessage('show_answers must be a boolean'),
  validate
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be >= 1')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('Limit must be 1-10000')
    .toInt(),
  validate
];

// UUID validation
const uuidValidation = (paramName) => [
  param(paramName)
    .isUUID().withMessage(`${paramName} must be a valid UUID`),
  validate
];

module.exports = {
  validate,
  questionValidation,
  questionSetValidation,
  paginationValidation,
  uuidValidation
};
