/**
 * Input Validation for Gemini Service
 * Uses Joi for schema validation
 */

const Joi = require('joi');

const questionRequestSchema = Joi.object({
  content: Joi.string().min(50).max(200000).required()
    .messages({
      'string.min': 'Content must be at least 50 characters',
      'string.max': 'Content exceeds maximum length of 200,000 characters',
      'any.required': 'Content is required'
    }),
  
  subject: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Subject must be at least 2 characters',
      'any.required': 'Subject is required'
    }),
  
  topic: Joi.string().min(2).max(200).required()
    .messages({
      'string.min': 'Topic must be at least 2 characters',
      'any.required': 'Topic is required'
    }),
  
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('hard')
    .messages({
      'any.only': 'Difficulty must be one of: easy, medium, hard'
    }),
  
  totalQuestions: Joi.number().integer().min(1).max(100).default(45)
    .messages({
      'number.min': 'Total questions must be at least 1',
      'number.max': 'Total questions cannot exceed 100'
    }),
  
  userId: Joi.string().uuid().optional().allow(null),
  
  onProgress: Joi.function().optional()
});

function validateQuestionRequest(data) {
  const { error, value } = questionRequestSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const errors = error.details.map(detail => detail.message).join('; ');
    return { valid: false, error: errors };
  }
  
  return { valid: true, value };
}

module.exports = {
  validateQuestionRequest
};
