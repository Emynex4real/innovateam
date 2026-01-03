/**
 * Unit Tests for Gemini Service
 * Run: npm test
 */

const GeminiService = require('../services/gemini.service.v2');
const { ValidationError, RateLimitError } = require('../utils/errors');

describe('GeminiService', () => {
  describe('Input Validation', () => {
    it('should reject content shorter than 50 characters', async () => {
      await expect(
        GeminiService.generateQuestionsFromContent({
          content: 'Short',
          subject: 'Math',
          topic: 'Algebra',
          totalQuestions: 10
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject invalid difficulty levels', async () => {
      await expect(
        GeminiService.generateQuestionsFromContent({
          content: 'A'.repeat(100),
          subject: 'Math',
          topic: 'Algebra',
          difficulty: 'impossible',
          totalQuestions: 10
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject totalQuestions > 100', async () => {
      await expect(
        GeminiService.generateQuestionsFromContent({
          content: 'A'.repeat(100),
          subject: 'Math',
          topic: 'Algebra',
          totalQuestions: 150
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Domain Instructions', () => {
    it('should return Math domain for mathematics', () => {
      const instructions = GeminiService.getDomainInstructions('Mathematics');
      expect(instructions).toContain('JAMB MATHEMATICS');
    });

    it('should return English domain for english', () => {
      const instructions = GeminiService.getDomainInstructions('English');
      expect(instructions).toContain('USE OF ENGLISH');
    });

    it('should return generic domain for unknown subjects', () => {
      const instructions = GeminiService.getDomainInstructions('Unknown Subject');
      expect(instructions).toContain('UNKNOWN SUBJECT');
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after threshold failures', () => {
      for (let i = 0; i < 5; i++) {
        GeminiService.recordFailure();
      }
      expect(GeminiService.circuitBreaker.isOpen).toBe(true);
    });

    it('should reset circuit after timeout', async () => {
      GeminiService.circuitBreaker.isOpen = true;
      GeminiService.circuitBreaker.lastFailure = Date.now() - 70000; // 70s ago
      
      GeminiService.checkCircuit();
      expect(GeminiService.circuitBreaker.isOpen).toBe(false);
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys', () => {
      const key1 = GeminiService._getCacheKey({
        content: 'test',
        subject: 'Math',
        topic: 'Algebra',
        difficulty: 'hard',
        totalQuestions: 10
      });

      const key2 = GeminiService._getCacheKey({
        content: 'test',
        subject: 'Math',
        topic: 'Algebra',
        difficulty: 'hard',
        totalQuestions: 10
      });

      expect(key1).toBe(key2);
    });

    it('should generate different keys for different inputs', () => {
      const key1 = GeminiService._getCacheKey({
        content: 'test1',
        subject: 'Math',
        topic: 'Algebra',
        difficulty: 'hard',
        totalQuestions: 10
      });

      const key2 = GeminiService._getCacheKey({
        content: 'test2',
        subject: 'Math',
        topic: 'Algebra',
        difficulty: 'hard',
        totalQuestions: 10
      });

      expect(key1).not.toBe(key2);
    });
  });
});
