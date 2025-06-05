import logger from './logger.service';

describe('LoggerService', () => {
  const originalConsole = { ...console };
  const mockConsole = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    group: jest.fn(),
    groupEnd: jest.fn(),
    table: jest.fn(),
    time: jest.fn(),
    timeEnd: jest.fn(),
  };

  beforeAll(() => {
    // Mock all console methods
    Object.assign(console, mockConsole);
  });

  afterAll(() => {
    // Restore original console
    Object.assign(console, originalConsole);
  });

  beforeEach(() => {
    // Clear all mocks before each test
    Object.values(mockConsole).forEach(mock => mock.mockClear());
  });

  describe('Log Levels', () => {
    it('should respect log levels', () => {
      logger.setLogLevel('error');
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should log all levels when in debug mode', () => {
      logger.setLogLevel('debug');
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(console.debug).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Message Formatting', () => {
    it('should format messages with timestamp and level', () => {
      const logData = logger.formatMessage('info', 'Test message');
      
      expect(logData).toEqual({
        timestamp: expect.any(String),
        level: 'info',
        message: 'Test message',
        args: [],
      });
    });

    it('should properly format error objects', () => {
      const error = new Error('Test error');
      const logData = logger.formatMessage('error', 'Error occurred', error);

      expect(logData.args[0]).toEqual({
        message: 'Test error',
        stack: expect.any(String),
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should measure synchronous operations', () => {
      const result = logger.measure('test-operation', () => {
        return 'result';
      });

      expect(result).toBe('result');
      expect(console.time).toHaveBeenCalledWith('test-operation');
      expect(console.timeEnd).toHaveBeenCalledWith('test-operation');
    });

    it('should measure asynchronous operations', async () => {
      const result = await logger.measureAsync('async-operation', async () => {
        return 'async-result';
      });

      expect(result).toBe('async-result');
      expect(console.time).toHaveBeenCalledWith('async-operation');
      expect(console.timeEnd).toHaveBeenCalledWith('async-operation');
    });

    it('should handle errors in measured operations', () => {
      expect(() => {
        logger.measure('error-operation', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      expect(console.time).toHaveBeenCalledWith('error-operation');
      expect(console.timeEnd).toHaveBeenCalledWith('error-operation');
    });
  });

  describe('Assertions', () => {
    it('should log error when assertion fails', () => {
      logger.assert(false, 'Assertion message');
      expect(console.error).toHaveBeenCalled();
      const logData = JSON.parse(console.error.mock.calls[0][0]);
      expect(logData.message).toContain('Assertion failed: Assertion message');
    });

    it('should not log error when assertion passes', () => {
      logger.assert(true, 'Assertion message');
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('Grouping', () => {
    it('should handle group operations', () => {
      logger.setLogLevel('debug');
      logger.group('Test Group');
      logger.debug('Grouped message');
      logger.groupEnd();

      expect(console.group).toHaveBeenCalledWith('Test Group');
      expect(console.debug).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });
  });

  describe('Table Output', () => {
    it('should handle table data', () => {
      logger.setLogLevel('debug');
      const data = [{ id: 1, name: 'Test' }];
      logger.table(data, ['id', 'name']);

      expect(console.table).toHaveBeenCalledWith(data, ['id', 'name']);
    });
  });
}); 