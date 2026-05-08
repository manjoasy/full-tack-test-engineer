import { logger } from '../../utils/logger';
import fs from 'fs';

describe('Logger Coverage Tests', () => {
  it('should have initialized logger correctly', () => {
    expect(logger).toBeDefined();
    expect(fs.existsSync('logs')).toBe(true);
  });

  it('should log messages without crashing', () => {
    // This is just to hit the code paths in logger
    logger.info('Test info message');
    logger.error('Test error message', { error: new Error('Test error') });
    logger.debug('Test debug message');
    logger.warn('Test warn message');
  });
});
